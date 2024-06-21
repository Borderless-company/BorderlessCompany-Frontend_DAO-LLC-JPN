import clientPromise from "@/utils/mongodb";

export interface CompanyProps {
  address: string;
  daoName: string;
  companyName: string;
  companyId: string;
}

export async function getAllCompanies(): Promise<CompanyProps[]> {
  const client = await clientPromise;
  const collection = client.db("test").collection("companies");
  return await collection.find<CompanyProps>({}).toArray();
}

export async function getCompany(
  address: string
): Promise<CompanyProps | null> {
  const client = await clientPromise;
  const collection = client.db("test").collection("companies");
  return await collection.findOne<CompanyProps>({ address: address });
}

export async function updateCompany(
  address: string,
  updateData: Partial<CompanyProps>
): Promise<void> {
  const client = await clientPromise;
  const collection = client.db("test").collection("companies");
  await collection.updateOne(
    { address: address },
    { $set: updateData },
    { upsert: true }
  );
}
