import { authService } from "@/server/auth";
import { db } from "@/server/db/client";
import { env } from "@/server/env";
import { storage } from "@/server/storage";
import { FileService } from "./file.service";
import { PropertyService } from "./property.service";
import { RoomService } from "./room.service";
import { UserService } from "./user.service";

// Satu rakitan service untuk seluruh aplikasi. Controller memanggil lewat sini.
export const services = {
  property: new PropertyService({ db }),
  room: new RoomService({ db }),
  user: new UserService({ db, auth: authService }),
  file: new FileService({ db, storage, secret: env.FILE_SIGNING_SECRET }),
};
