import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import fs from "fs";

// add food items

const addFood = async (req, res) => {
  let image_filename = `${req.file.filename}`;
  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
  });
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await food.save();
      res.json({ success: true, message: "Food Added" });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// all foods
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ 
      success: true, 
      data: foods.map(food => ({
        _id: food._id,
        name: food.name,
        description: food.description,
        price: food.price,
        category: food.category,
        image: `${food.image}` 
      }))
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// remove food item
const removeFood = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const food = await foodModel.findById(req.body.id);
      fs.unlink(`uploads/${food.image}`, () => {});
      await foodModel.findByIdAndDelete(req.body.id);
      res.json({ success: true, message: "Food Removed" });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// No foodController.js
const editFood = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (!userData || userData.role !== "admin") {
      return res.json({ success: false, message: "Você não tem permissão para editar" });
    }

    let updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
    };

    // Se uma nova imagem foi enviada
    if (req.file) {
      // Remove a imagem antiga
      const oldFood = await foodModel.findById(req.body.id);
      if (oldFood.image) {
        fs.unlink(`uploads/${oldFood.image}`, () => {});
      }
      
      updateData.image = req.file.filename;
    }

    await foodModel.findByIdAndUpdate(req.body.id, updateData);
    res.json({ success: true, message: "Prato atualizado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao editar o prato" });
  }
};

export { addFood, listFood, removeFood, editFood };

