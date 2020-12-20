# realtime-web-chat
## Short Description
University project, which is focused on creating a realtime-web-chat.  
## Concept
Chat provides possibility to talk to people, who use the same app.
## Functionality
* talking to everyone in big group chat;
* search function;
* separate rooms;
* choose name/nickname;
* choose photo.
## Structure
*realtime-web-chat* consists of backend an frontend.  
Its backend is written in nodejs and with the help of websockets, more precisely with [ws library](https://github.com/websockets/ws). Transfer of data over the Hyper Text Transfer Protocol is being performed by a built-in nodejs module http.  
Frontend consists of one html, one css and three js files. Main frontend file - **main.js** adds eventlisteners on existing elements.  
There are also two main classes, which are held in separate files (for easier navigation and better code structure). First - **MessageToServer** hierarchy. It helps organizing information, which needs to be passed to server and also provides a fuction for that. Second class is called **Listeners**. It holds all information needed to select elements, to navigate through them, also all listeners are methods in this class.  
## Author
[Gorbunova Yelyzaveta](https://github.com/lizardlynx)  

