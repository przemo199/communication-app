export interface Message {
  id: number
  userName: string
  message: string
}

export const data: Message[] = [
  {id: 1, userName: "john", message: "Hello"},
  {id: 2, userName: "peter", message: "Hi John"},
  {id: 3, userName: "john", message: "Hi Peter"},
  {id: 4, userName: "anna", message: "Hey Guys"}
];
