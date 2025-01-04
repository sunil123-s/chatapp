import { useMutation } from "@tanstack/react-query"
import axios from "axios"

export const useLogin = () => {
    const {mutate:login,isLoading,isError,error} = useMutation({
        mutationFn: async(formdata) => {
            const res = await axios.post(
              `${import.meta.env.VITE_BACKEND_API_URL}/auth/login`,
              formdata
            );
          const response = res.data;
          return response;
        }
    })
    return { login,isLoading, isError, error };
}