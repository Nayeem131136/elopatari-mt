import logoImg from "@/assets/logo-brand.png";

const Logo = ({ className = "" }: { className?: string }) => (
  <img src={logoImg} alt="এলোপাতাড়ি - MT Logo" className={`rounded-full object-cover ${className}`} />
);

export default Logo;
