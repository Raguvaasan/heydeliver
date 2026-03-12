import axios from "axios";
const client = axios.create({ baseURL: "/api" });
console.log(client.getUri({url: "/admin/auth/login"}));
console.log(client.getUri({url: "admin/auth/login"}));
console.log(client.getUri({url: "https://example.com/test"}));
