export async function createPaystackSubaccount({
  name,
  bankCode,
  accountNumber,
}: {
  name: string;
  bankCode: string;
  accountNumber: string;
}) {
  const res = await fetch("https://api.paystack.co/subaccount", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      business_name: name,
      bank_code: bankCode,
      account_number: accountNumber,
      percentage_charge: 80, // Organizer’s share
    }),
  });

  const data = await res.json();

  if (!data.status) {
    throw new Error(data.message || "Failed to create Paystack subaccount");
  }

  return {
    subaccountCode: data.data.subaccount_code,
    accountName: data.data.account_name || name,
  };
}

