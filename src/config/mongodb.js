import mongoose from "mongoose";

/**
 * Wait for MongoDB replica set to be in PRIMARY state
 */
async function waitForMongoPrimary() {
  const maxRetries = 30;
  const retryDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const adminDb = mongoose.connection.db.admin();
      const status = await adminDb.command({ replSetGetStatus: 1 });

      if (status && status.members) {
        const primaryMember = status.members.find(
          (member) => member.stateStr === "PRIMARY"
        );

        if (primaryMember) {
          return;
        }
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    } catch (error) {
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        return;
      }
    }
  }
}

export default async function connectMongoDB() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/aseguradora?directConnection=true&replicaSet=rs0"
    );
    console.log("MongoDB conectado exitosamente");

    await waitForMongoPrimary();
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
    process.exit(1);
  }
}
