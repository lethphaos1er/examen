import './style.css'
import Contactlist from './components/contactList/contactList.js'


const contactList = new Contactlist({
  elt: '#app',
  apiURL: 'https://68ad9563a0b85b2f2cf3e290.mockapi.io/'
})
// exposer l’instance pour delete
window.contactList = contactList
