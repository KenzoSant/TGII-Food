import React, { useContext, useEffect } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from "react-toastify";

const Verify = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const { url, token, setCartItems } = useContext(StoreContext);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            if (success && orderId) {
                try {
                    const currentToken = token || localStorage.getItem('token');
                    if (!currentToken) {
                        toast.error("Sessão expirada. Por favor, faça login novamente.");
                        navigate("/login");
                        return;
                    }

                    const response = await axios.post(`${url}/api/order/verify`, {
                        orderId,
                        success
                    }, {
                        headers: {
                            Authorization: `Bearer ${currentToken}`
                        }
                    });

                    if (response.data.success) {
                        // Limpa o carrinho no contexto
                        if (setCartItems) setCartItems({});
                        toast.success("Pagamento confirmado! Seu pedido está sendo preparado.");
                    } else {
                        toast.error(response.data.message || "Houve um problema ao confirmar seu pagamento.");
                    }
                } catch (error) {
                    console.error("Erro na verificação:", error);
                    toast.error(error.response?.data?.message || "Erro ao verificar pagamento");
                } finally {
                    navigate('/myorders');
                }
            }
        };

        verifyPayment();
    }, [success, orderId, url, token, navigate, setCartItems]);
    
    return (
        <div className='verify'>
            <div className="spinner"></div>
        </div>
    )
}

export default Verify