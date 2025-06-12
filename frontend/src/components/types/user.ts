export interface User {
    id : string;
    username : string;
    email : string;
    authProvider : string;
}

// for ref
// model User {
//   id    Int     @id @default(autoincrement())
//   email String  @unique
//   name  String?
//   passwordHash String?
//   QueryResps QueryResp[]
//   messages Message[] @relation("MessageAuthor")
//   createdAt DateTime @default(now())
//   updatedAt DateTime @default(now())
//   conversations Conversation[] @relation("UserConversations")

//   @@index([email])
// }
