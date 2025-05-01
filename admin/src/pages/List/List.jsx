import React, { useEffect, useState } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const List = () => {
  const navigate = useNavigate();
  const { token, admin, url } = useContext(StoreContext);
  const [list, setList] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null,
    previewImage: ""
  });

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Erro ao carregar a lista");
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
    }
  };

  const confirmRemove = (item) => {
    setCurrentItem(item);
    setShowDeleteModal(true);
  };

  const removeFood = async () => {
    try {
      const response = await axios.post(
        `${url}/api/food/remove`,
        { 
          id: currentItem._id, 
          userId: localStorage.getItem("userId") 
        },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success("Prato removido com sucesso!");
        fetchList();
      } else {
        toast.error(response.data.message || "Erro ao remover");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover o prato");
    } finally {
      setShowDeleteModal(false);
      setCurrentItem(null);
    }
  };

  const openEditModal = (item) => {
    setCurrentItem(item);
    setEditForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: null,
      previewImage: `${url}/images/${item.image}`
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setCurrentItem(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        image: file,
        previewImage: URL.createObjectURL(file)
      }));
    }
  };

  const submitEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("id", currentItem._id);
      formData.append("userId", localStorage.getItem("userId"));
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      formData.append("price", editForm.price);
      formData.append("category", editForm.category);
      
      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      const response = await axios.post(
        `${url}/api/food/edit`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "multipart/form-data"
          } 
        }
      );
      
      if (response.data.success) {
        toast.success("Prato editado com sucesso!");
        fetchList();
        closeEditModal();
      } else {
        toast.error(response.data.message || "Erro ao editar");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao editar o prato. Verifique sua conexão.");
    }
  };

  useEffect(() => {
    if (!admin && !token) {
      toast.error("Por favor, faça login primeiro");
      navigate("/");
    } else {
      fetchList();
    }
  }, [admin, token, navigate]);

  return (
    <div className="list add flex-col">
      <p>Todos os Itens do Cardápio</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Imagem</b>
          <b>Nome</b>
          <b>Categoria</b>
          <b>Preço</b>
          <b>Ações</b>
        </div>
        {list.map((item, index) => (
          <div key={index} className="list-table-format">
            <img src={`${url}/images/` + item.image} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>R${item.price}</p>
            <div className="actions">
              <button 
                onClick={() => openEditModal(item)} 
                className="edit-btn"
              >
                <i className="fas fa-edit"></i> Editar
              </button>
              <button 
                onClick={() => confirmRemove(item)} 
                className="remove-btn"
              >
                <i className="fas fa-trash"></i> Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Item</h2>
              <span className="close-btn" onClick={closeEditModal}>&times;</span>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome:</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Descrição:</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Categoria:</label>
                <input
                  type="text"
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Preço (R$):</label>
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Imagem:</label>
                <div className="image-preview">
                  <img src={editForm.previewImage} alt="Preview" />
                </div>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeEditModal} className="cancel-btn">
                Cancelar
              </button>
              <button onClick={submitEdit} className="save-btn">
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Remoção */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <div className="modal-header">
              <h2>Confirmar Remoção</h2>
              <span className="close-btn" onClick={() => setShowDeleteModal(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja remover o prato <strong>{currentItem?.name}</strong>?</p>
              <p>Esta ação não pode ser desfeita.</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="cancel-btn"
              >
                Cancelar
              </button>
              <button 
                onClick={removeFood} 
                className="confirm-remove-btn"
              >
                Confirmar Remoção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;