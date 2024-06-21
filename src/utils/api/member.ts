import clientPromise from "@/utils/mongodb";

export interface MemberProps {
  address: string;
  name: string;
}

export async function getAllMembers(): Promise<MemberProps[]> {
  const client = await clientPromise;
  const collection = client.db("test").collection("members");
  return await collection.find<MemberProps>({}).toArray();
}

export async function getMember(address: string): Promise<MemberProps | null> {
  const client = await clientPromise;
  const collection = client.db("test").collection("members");
  return await collection.findOne<MemberProps>({ address: address });
}

export async function updateMember(
  address: string,
  updateData: Partial<MemberProps>
): Promise<void> {
  const client = await clientPromise;
  const collection = client.db("test").collection("members");
  await collection.updateOne(
    { address: address },
    { $set: updateData },
    { upsert: true }
  );
}
