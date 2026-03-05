import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axios";

const Auth = () => {
  const [client, setClient] = useState({
    name: "",
  });
  const navigate = useNavigate();

  function onInpChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit() {
    const response = await axiosInstance.post("/client", {
      ...client,
    });

    if (response.data.data.user) {
      navigate("/rooms", {
        state: response.data.data.user,
      });
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Enter name"
        name="name"
        value={client.name}
        onChange={onInpChange}
      />

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default Auth;
