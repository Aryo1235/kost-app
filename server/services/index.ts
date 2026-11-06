import { authService } from "@/server/auth";
import { db } from "@/server/db/client";
import { PropertyService } from "./property.service";
import { UserService } from "./user.service";

// Satu rakitan service untuk seluruh aplikasi. Controller memanggil lewat sini.
export const services = {
  property: new PropertyService({ db }),
  user: new UserService({ db, auth: authService }),
};
