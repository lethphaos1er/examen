import './style.css'

// class DB
class DB {
  static setApiURL(data) {
    this.apiURL = data
  }
  
  static async findAll() {
    const response = await fetch(this.apiURL + "contacts")
    return response.json()
  }
  
  static async create(contact) {
    const res = await fetch(this.apiURL + 'contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        firstname: contact.firstname,
        lastname:  contact.lastname,
        email:     contact.email,
      }),
    })
    return res.json()
  }

  // ✅ GET /contacts/:id
  static async findById(id) {
    const res = await fetch(this.apiURL + 'contacts/' + id, {
      headers: { 'Accept': 'application/json' }
    })
    return res.json()
  }

  // ✅ PUT /contacts/:id
  static async findByIdAndUpdate(id, partial) {
    const res = await fetch(this.apiURL + 'contacts/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(partial),
    })
    return res.json()
  }

  static async findByIdAndRemove(id) {
    const res = await fetch(this.apiURL + 'contacts/' + id, {
      method: 'DELETE',
    })
    return res.json()
  }
}

// class Contact début
class Contact {
  constructor(data) {
    this.id = data.id
    this.firstname = data.firstname
    this.lastname = data.lastname
    this.email = data.email
  }

  render() {
    return getContactTemplate(this)
  }

  // Événements: edit (✏️) -> GET + entrer en édition ; check (✓) -> UPDATE
  initevent(){
    // ✏️ Edit
    this.domElt.querySelector('.btn-edit')?.addEventListener('click', async (e) => {
      e.preventDefault()
      const fresh = await DB.findById(this.id)
      const inputFirst = this.domElt.querySelector('.input-firstname')
      const inputLast  = this.domElt.querySelector('.input-lastname')
      const inputEmail = this.domElt.querySelector('.input-email')
      if (fresh) {
        if (inputFirst) inputFirst.value = fresh.firstname ?? inputFirst.value
        if (inputLast)  inputLast.value  = fresh.lastname  ?? inputLast.value
        if (inputEmail) inputEmail.value = fresh.email     ?? inputEmail.value
      }
      this.domElt.classList.add('isEditing')
    })

    // ✓ Save (UPDATE)
    this.domElt.querySelector('.btn-check')?.addEventListener('click', async (e) => {
      e.preventDefault()
      const inputFirst = this.domElt.querySelector('.input-firstname')
      const inputLast  = this.domElt.querySelector('.input-lastname')
      const inputEmail = this.domElt.querySelector('.input-email')

      const payload = {
        firstname: (inputFirst?.value || '').trim(),
        lastname:  (inputLast?.value  || '').trim(),
        email:     (inputEmail?.value || '').trim(),
      }

      const updated = await DB.findByIdAndUpdate(this.id, payload)

      // maj locales
      this.firstname = updated.firstname ?? payload.firstname
      this.lastname  = updated.lastname  ?? payload.lastname
      this.email     = updated.email     ?? payload.email

      // maj DOM (spans + inputs) sans re-render
      const spanFirst = this.domElt.querySelector('td:nth-child(1) .isEditing-hidden')
      const spanLast  = this.domElt.querySelector('td:nth-child(2) .isEditing-hidden')
      const spanEmail = this.domElt.querySelector('td:nth-child(3) .isEditing-hidden')
      if (spanFirst) spanFirst.textContent = this.firstname
      if (spanLast)  spanLast.textContent  = this.lastname
      if (spanEmail) spanEmail.textContent = this.email
      if (inputFirst) inputFirst.value = this.firstname
      if (inputLast)  inputLast.value  = this.lastname
      if (inputEmail) inputEmail.value = this.email

      // sortir du mode édition
      this.domElt.classList.remove('isEditing')
    })

    // 🗑️ Delete
    this.domElt.querySelector('.destroy')?.addEventListener('click', (e) => {
      e.preventDefault()
      window.contactList?.findByIdAndRemove?.(this.id)
    })
  }
}

//template Contact début (✅ spans remis)
function getContactTemplate(contact) {
  return `<tr data-id="${contact.id}">
        <td class="p-4">
            <span class="isEditing-hidden">${contact.firstname}</span>
            <input type="text" class="input-firstname isEditing-visible w-full mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md" value="${contact.firstname}"/>
        </td>
        <td class="p-4">
            <span class="isEditing-hidden">${contact.lastname}</span>
            <input type="text" class="input-lastname isEditing-visible w-full mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md" value="${contact.lastname}"/>
        </td>
        <td class="p-4">
            <span class="isEditing-hidden">${contact.email}</span>
            <input type="text" class="input-email isEditing-visible w-full mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md" value="${contact.email}"/>
        </td>
        <td class="p-4">
            <div class="flex justify-end space-x-2">
                <button class="btn-check isEditing-visible bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button class="btn-edit isEditing-hidden bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-md">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-delete isEditing-hidden bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">
                    <i class="fa-solid fa-trash destroy"></i>
                </button>
            </div>
        </td>
    </tr>`
}
//template Contact fin
// class Contact fin

//class Contactlist début
class Contactlist {
  constructor(data) {
    this.domElt = document.querySelector(data.elt)
    DB.setApiURL(data.apiURL)
    this.contacts = []
    this.loadContacts()
  }
  
  async loadContacts() {
    const contactsData = await DB.findAll()
    this.contacts = contactsData.map((contact) => new Contact(contact))
    this.render()
  }
  
  // Rendu aside + table
  render() {
    this.domElt.innerHTML = `
      ${getAddContactTemplate()}
      <section class="w-2/3 p-6">
        ${getContactlistTemplate(this)}
      </section>
    `
    this.bindAddForm()

    // bind des lignes existantes
    const tbody = this.domElt.querySelector('tbody')
    if (tbody) {
      const rows = Array.from(tbody.querySelectorAll('tr'))
      rows.forEach((tr, idx) => {
        const c = this.contacts[idx]
        if (c) {
          c.domElt = tr
          c.initevent?.()
        }
      })
    }
  }

  bindAddForm() {
    const root = this.domElt
    const inputFirstname = root.querySelector('#new-firstname')
    const inputLastname  = root.querySelector('#new-lastname')
    const inputEmail     = root.querySelector('#new-email')
    const btnAdd         = root.querySelector('#btn-add')
    const tbody          = root.querySelector('tbody')

    if (!btnAdd || !tbody) return

    btnAdd.addEventListener('click', async (e) => {
      e.preventDefault()

      const data = {
        firstname: (inputFirstname?.value || '').trim(),
        lastname:  (inputLastname?.value  || '').trim(),
        email:     (inputEmail?.value     || '').trim(),
      }
      if (!data.firstname || !data.lastname || !data.email) return

      // créer côté API
      const created = await DB.create(data)

      // instancier + insérer la ligne sans re-render
      const newContact = new Contact(created)
      tbody.insertAdjacentHTML('beforeend', newContact.render())

      // binder la nouvelle ligne
      const tr = tbody.lastElementChild
      newContact.domElt = tr
      newContact.initevent?.()

      // reset des champs + focus
      if (inputFirstname) inputFirstname.value = ''
      if (inputLastname)  inputLastname.value  = ''
      if (inputEmail)     inputEmail.value     = ''
      inputFirstname?.focus()
    })
  }

  async findByIdAndRemove(id) {
    const resp = await DB.findByIdAndRemove(id)
    // (tu avais demandé de ne pas modifier cette ligne même si "=" est piégeux)
    this.contacts.splice(this.contacts.findIndex(contact => contact.id = id), 1)
    this.domElt.querySelector(`tr[data-id="${id}"]`)?.remove()
  }
}
// Templates contactlist début
function getContactlistTemplate(contactList) {
  return `
        <table class="min-w-full divide-y divide-gray-200">
            <thead>
                <tr>
                    <th class="p-4 text-gray-600 font-semibold">Prénom</th>
                    <th class="p-4 text-gray-600 font-semibold">Nom</th>
                    <th class="p-4 text-gray-600 font-semibold">Email</th>
                    <th class="p-4 text-gray-600 font-semibold text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${contactList.contacts.map(contact => contact.render()).join('')}
            </tbody>
        </table>
    `
}
//template Contactlist fin
//class Contactlist fin

//creation de add début
class AddContact {
  async addContact(data) {
    const contact = await DB.create(data)
    return contact
  }
}

// Aside (colonne gauche)
function getAddContactTemplate() {
  return `<aside class="w-1/3 bg-gray-200 p-6 pb-12">
        <h2 class="text-xl font-bold mb-4">Add a Contact</h2>
        <div class="mb-4">
          <label class="block text-gray-700">Firstname</label>
          <input id="new-firstname" type="text"
            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Alex" />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700">Lastname</label>
          <input id="new-lastname" type="text"
            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Doe" />
        </div>
        <div class="mb-6">
          <label class="block text-gray-700">Email</label>
          <input id="new-email" type="email"
            class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="alex.doe@gmail.com" />
        </div>
        <button id="btn-add" type="button"
          class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
          Add
        </button>
      </aside>`
}
//templates contact add fin
//creation de add fin

const contactList = new Contactlist({
  elt: '#app',
  apiURL: 'https://68ad9563a0b85b2f2cf3e290.mockapi.io/'
})
// exposer l’instance pour delete
window.contactList = contactList
