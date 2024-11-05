/*

Задача 1

Написать метод на JS, который будет устанавливать в браузере новую куку. 
Выставлять ей срок жизни (3 дня), ограничивать куку в рамках определенного домена, защитить куку от атаки XSRF.

*/

function setCookie(name, value, days, domain) {
  var d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = name + "=" + value + "; secure=true; samesite=lax;" + "expires=" + expires + "; domain="+domain+";"
}

setCookie('user', 'USER_NEW', 3, 'oggetto.ru');

console.log( document.cookie)

/*
Задача 2
Написать метод, который будет класть данные в Local Storage по ключу, в зависимости от типа данных. 
И второй метод, который будет получать данные из LocalStorage по ключу, в зависимости от типов данных.*/

function setlocalStorage (key, item) {
  localStorage.setItem(key , JSON.stringify(item));
}
function getlocalStorage (key) {
  return JSON.parse(localStorage.getItem(key))
}

const user = {
  name: "Alex",
  age: 25
};

setlocalStorage('item', user)
setlocalStorage('item2', '123')
setlocalStorage('item3', 111)

const item = getlocalStorage('item');
console.log(item);
const item2 = getlocalStorage('item2');
console.log(item2);
const item3 = getlocalStorage('item3');
console.log(item3);



/*
Задача 3
Написать метод, который будет делать запрос на получение пользователей(https://jsonplaceholder.typicode.com/users), записывать их в IndexedDB. Написать метод, который будет принимать id-пользователя, искать есть ли он IndexedDB, если нет, 
делать запрос на JSONplaceholder(https://jsonplaceholder.typicode.com/users?id=[id]) и если пользователь не найден, возвращать сообщение через alert.
*/

var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

const getButtons = document.querySelector(".getUser");
const searchButtons = document.querySelector(".searchUser");

getButtons.addEventListener("click", event => {
  getUserList();
});

searchButtons.addEventListener("click", event => {
  searchUser(8);
});

const createDb = (items) => {
  const request = indexedDB.open("userDB", 2);
 
  request.onupgradeneeded = (event) => { 
      const db = event.target.result; 
      const objectStore = db.createObjectStore("users", { keyPath: "id", autoIncrement: true });
  };

  request.onsuccess = (event) => { 
    const db = event.target.result; 
    const transaction = db.transaction(["users"], "readwrite"); 
    const userStore = transaction.objectStore("users"); 
 
    for (index = 0; index < items.length; ++index) {
      let itemUser = items[index]

      const addRequest = userStore.add(itemUser);
      addRequest.onsuccess = (event) => {
          console.log("Данные успешно добавлены");
          console.log("id добавленной записи:", addRequest.result);
      };
    }

    const getRequest = userStore.getAll();
    getRequest.onsuccess = (e) => {
        const users = getRequest.result;
    }
    getRequest.onerror = (e) =>  console.log(e.target.error.message);
  };
};

const getUserList = async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  const userList = await response.json();
  createDb(userList);
}

const getUser = async (id, e) => {
  try {
    e.preventDefault();
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}/`);
    const user = await response.json();
  }
  catch(e){
    alert('Пользователь  не найден')
  };
}


const searchUser = (id) => {
  const request = indexedDB.open("userDB", 2);
  request.onsuccess = (event) => { 
    const db = event.target.result;

    const transaction = db.transaction(["users"]);
    const userStore = transaction.objectStore("users");
 
    const getRequest = userStore.getAll();

    getRequest.onsuccess = (e) => {
        const users = getRequest.result;

        let resultState = false

        for (index = 0; index < users.length; ++index) {
          let itemUser = users[index]

          if (itemUser.id === id) {
            resultState = true
            alert(`Пользователь найден в indexedDB ${itemUser.name}`)
          } 
        }

        if (!resultState) {
          getUser(id)
        }
    }
    getRequest.onerror = (e) =>  console.log(e.target.error.message);
  };
}
