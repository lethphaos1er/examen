  import '../src/style.css'

// class DB
  class DB {
    static setApiURL(data) {
      this.apiURL = data
    }
    
    static async findAll() {
      const response = await fetch(this.apiURL + "contacts")
      return response.json()
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
    async toggleComplete(){
      //modif du tableau
      this.isComplete = !this.isComplete
      //modif du DOM
      this.domElt.classList.toggle('isComplete', this.isComplete)
      //modif de la DB
      return await DB.update(this);
    }
    initevent(){
      this.domElt.querySelector('.btn-edit').addEventListener('click', (e) => {
        e.target.closest('tr').classList.add('isEditing')
      }
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
    
    render() {
      this.domElt.innerHTML = getContactlistTemplate(this)
    }
  }
  // Templates contactlist début
  function getContactlistTemplate(contactList) {
    return `
          <table class="min-w-full divide-y divide-gray-200">
              <thead>
                  <tr>
                      <th class="p-4">Prénom</th>
                      <th class="p-4">Nom</th>
                      <th class="p-4">Email</th>
                      <th class="p-4">Actions</th>
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

  const contactList = new Contactlist({
    elt: '#app',
    apiURL: 'https://68ad9563a0b85b2f2cf3e290.mockapi.io/'
  })