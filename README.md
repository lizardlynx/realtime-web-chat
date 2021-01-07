# realtime-web-chat
## Short Description
University project, which is focused on creating a realtime-web-chat.  
Now posted [here](https://realtime-web-chat.herokuapp.com/)!
## IMPORTANT TO KNOW BEFORE USING  
For demonstration purposes every new tab in browser is an equivalent of a different user.
## Concept
Chat provides possibility to talk to people, who use the same app. Users are able to do that either in group chat, or in separate rooms.
## Functionality
* talking to everyone in big group chat;
* search function;
* separate rooms;
* choose name/nickname;
* choose photo.
## Structure
*realtime-web-chat* consists of backend an frontend.  
### Backend  
Its backend is written in nodejs and with the help of websockets, more precisely with [ws library](https://github.com/websockets/ws). Transfer of data over the Hyper Text Transfer Protocol is being performed by a built-in nodejs module http.  
The main file - index.js - includes class **ServerFuncs**, which handles every function, and message from server. It includes class **FileManager**, which works with files, and also class hierarchy **MessageToClient**, which organizes every pattern for sending messages to client.
### Frontend  
Frontend consists of one html, one css and three js files. Main frontend file - **main.js** adds eventlisteners on existing elements.  
There are also two main classes, which are held in separate files (for easier navigation and better code structure). First - **MessageToServer** hierarchy. It helps organizing information, which needs to be passed to server and also provides a fuction for that. Second class is called **Listeners**. It holds all information needed to select elements, to navigate through them, also all listeners are methods in this class.  
### Class diagram  
![Class Diagram](https://github.com/lizardlynx/realtime-web-chat/blob/main/docs/ClassDiagram(1).png)
## Author
[Gorbunova Yelyzaveta](https://github.com/lizardlynx)  
## License
MIT © [realtime-web-chat](https://github.com/lizardlynx/realtime-web-chat)

