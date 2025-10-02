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

  initevent(){
    // laissé tel quel (orthographe d'origine)
    this.domElt && this.domElt.querySelector && this.domElt.querySelector('.btn-edit')?.addEventListener('click', (e) => {
      e.target.closest('tr').classList.add('isEditing')
    });
  }
}
//template Contact début
function getContactTemplate(contact) {
  return `<tr>
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
                    <i class="fa-solid fa-trash"></i>
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
    this.bindAddForm() // binder l’add après rendu
  }

  // Ajout incrémental + reset des champs
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

      // 1) créer côté API (created_at auto DB)
      const created = await DB.create(data)

      // 2) instancier + insérer la ligne sans re-render
      const newContact = new Contact(created)
      tbody.insertAdjacentHTML('beforeend', newContact.render())

      // 3) binder l’édition sur la nouvelle ligne si besoin
      const tr = tbody.lastElementChild
      newContact.domElt = tr
      newContact.initevent?.()

      // 4) reset des champs + focus
      if (inputFirstname) inputFirstname.value = ''
      if (inputLastname)  inputLastname.value  = ''
      if (inputEmail)     inputEmail.value     = ''
      inputFirstname?.focus()
    })
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

  initEvent() {
    // TODO: brancher plus tard si nécessaire
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
