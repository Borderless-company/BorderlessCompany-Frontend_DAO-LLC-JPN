import React, { useState } from "react";

const UpdateCompanyForm = ({ daoId }: { daoId: string }) => {
  const [daoName, setDaoName] = useState("");

  const updateCompanyInfo = async (newData: { daoName: string }) => {
    const response = await fetch(`/api/companies/${daoId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    });

    if (!response.ok) {
      throw new Error("Failed to update company information");
    }

    const updatedData = await response.json();
    return updatedData;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await updateCompanyInfo({ daoName });
      alert("会社名が更新されました。");
    } catch (error) {
      alert("更新に失敗しました。");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="daoName">DAOの名前:</label>
      <input
        type="text"
        id="daoName"
        value={daoName}
        onChange={(e) => setDaoName(e.target.value)}
        required
      />
      <button type="submit">更新</button>
    </form>
  );
};

export default UpdateCompanyForm;
