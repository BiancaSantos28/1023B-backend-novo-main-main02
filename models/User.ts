import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

// Interface para o documento do usuário
export interface IUser extends Document {
  name: string;
  email: string;
  password: string; // senha original (antes do hash)
  role: "ADMIN" | "USER";
  comparePassword(password: string): Promise<boolean>;
}

// Esquema do usuário
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // armazenaremos o hash aqui
  role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
});

// Antes de salvar, gerar o hash da senha se ela foi modificada
userSchema.pre<IUser>("save", async function (next) {
  const user = this;

  // Verifica se a senha foi modificada
  if (!user.isModified("password")) return next();

  try {
    // Gera o hash da senha
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err) {
    next(err as any); // Passa o erro para o próximo middleware
  }
});

// Método de comparação de senha
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Exporta o modelo
export default model<IUser>("User", userSchema);