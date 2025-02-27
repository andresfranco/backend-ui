// Access environment variables
const SERVER_HOSTNAME = process.env.REACT_APP_SERVER_HOSTNAME;
const SERVER_PORT = process.env.REACT_APP_SERVER_PORT;
const SERVER_PROTOCOL = process.env.REACT_APP_SERVER_PROTOCOL;

const SERVER_URL = `${SERVER_PROTOCOL}://${SERVER_HOSTNAME}:${SERVER_PORT}`;
export default SERVER_URL;