import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "../../components/ui/StatCard";
import { Car, Users, MessageSquare, TrendingUp } from "lucide-react";

describe("StatCard component", () => {
  it("renders the title", () => {
    render(<StatCard title="Vehículos disponibles" value="85" icon={Car} color="bg-blue-500" />);
    expect(screen.getByText("Vehículos disponibles")).toBeInTheDocument();
  });

  it("renders the value", () => {
    render(<StatCard title="Usuarios" value="52" icon={Users} color="bg-green-500" />);
    expect(screen.getByText("52")).toBeInTheDocument();
  });

  it("renders different titles correctly", () => {
    render(<StatCard title="Mensajes" value="340" icon={MessageSquare} color="bg-red-500" />);
    expect(screen.getByText("Mensajes")).toBeInTheDocument();
  });

  it("renders different values correctly", () => {
    render(<StatCard title="Ventas" value="1.200 €" icon={TrendingUp} color="bg-yellow-500" />);
    expect(screen.getByText("1.200 €")).toBeInTheDocument();
  });

  it("applies the color class to the icon container", () => {
    const { container } = render(
      <StatCard title="Test" value="0" icon={Car} color="bg-purple-500" />
    );
    const iconWrapper = container.querySelector(".bg-purple-500");
    expect(iconWrapper).toBeInTheDocument();
  });

  it("renders an SVG icon", () => {
    const { container } = render(
      <StatCard title="Test" value="0" icon={Car} color="bg-blue-500" />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders the card container with white background", () => {
    const { container } = render(
      <StatCard title="Test" value="42" icon={Car} color="bg-blue-500" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("bg-white");
  });

  it("value is displayed in a heading-level element", () => {
    render(<StatCard title="Count" value="99" icon={Car} color="bg-blue-500" />);
    const value = screen.getByText("99");
    expect(value.tagName).toBe("H3");
  });

  it("title is displayed in a paragraph element", () => {
    render(<StatCard title="My Title" value="10" icon={Car} color="bg-blue-500" />);
    const title = screen.getByText("My Title");
    expect(title.tagName).toBe("P");
  });
});
