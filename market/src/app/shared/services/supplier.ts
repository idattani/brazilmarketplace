import { AngularFireStorageReference } from "@angular/fire/compat/storage";
import { StorageReference } from "@angular/fire/storage";

export interface Supplier {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    emailVerified: boolean;
    contact_name: string;
    address: any;
    phone_number: string;
    company_name: string;
    isSupplier: boolean;
    image_file: string;
    brief_description: string;
    long_description: string;
    company_url: string;
    categories: any;
    certifications: any;
    level3_categories: any;
    unread_messages: number;
 }
