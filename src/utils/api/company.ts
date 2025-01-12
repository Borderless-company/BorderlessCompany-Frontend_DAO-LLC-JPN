export const hasCompany = async (address: string) => {
  try {
    const response = await fetch(`/api/company?founder_id=${address}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const json = await response.json();
    console.log("hasCompany: ", json);
    return !!json.data;
  } catch (error) {
    throw new Error("Failed to fetch company");
  }
};
