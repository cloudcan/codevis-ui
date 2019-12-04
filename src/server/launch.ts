import { openDB, closeDB } from "./db";
import { serveHttp } from ".";

openDB();
serveHttp();
closeDB();
