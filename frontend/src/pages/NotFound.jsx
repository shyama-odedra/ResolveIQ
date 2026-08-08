import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import AuroraBackground from "../components/AuroraBackground";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center p-4">
      <AuroraBackground />
      <div className="relative z-10">
        <h1 className="text-6xl font-display font-bold mb-2">404</h1>
        <p className="text-text-secondary mb-6">This page doesn't exist.</p>
        <Link to="/dashboard">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
