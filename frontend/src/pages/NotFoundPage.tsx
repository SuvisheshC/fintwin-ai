import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-grad-dark text-white px-4 text-center">
      <h1 className="font-display text-7xl font-extrabold bg-clip-text text-transparent bg-grad-mint mb-4">
        404
      </h1>
      <p className="text-slate-300 mb-8">This page doesn't exist in your financial universe.</p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
