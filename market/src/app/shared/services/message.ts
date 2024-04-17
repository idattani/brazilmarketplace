export interface Message {
    message: string;
    sender: string;
    senderId: string;
    receiverId: string;
    subject: string;
    timestamp: any;
    edited: boolean;
    participants: any;
}
