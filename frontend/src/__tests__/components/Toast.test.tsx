import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Toast from "../../helpers/Toast";

describe("Toast component", () => {
  it("renders the message text", () => {
    render(
      <Toast message="Operación exitosa" type="success" onClose={vi.fn()} />
    );
    expect(screen.getByText("Operación exitosa")).toBeInTheDocument();
  });

  it("renders error message text", () => {
    render(
      <Toast message="Ha ocurrido un error" type="error" onClose={vi.fn()} />
    );
    expect(screen.getByText("Ha ocurrido un error")).toBeInTheDocument();
  });

  it("applies green styling for success type", () => {
    const { container } = render(
      <Toast message="OK" type="success" onClose={vi.fn()} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("green");
  });

  it("applies red styling for error type", () => {
    const { container } = render(
      <Toast message="Error" type="error" onClose={vi.fn()} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("red");
  });

  it("calls onClose when the close button is clicked", async () => {
    const handleClose = vi.fn();
    render(<Toast message="Test" type="success" onClose={handleClose} />);

    const closeButton = screen.getByRole("button");
    await userEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders a close button", () => {
    render(<Toast message="Test" type="success" onClose={vi.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders with fixed positioning class", () => {
    const { container } = render(
      <Toast message="Fixed" type="success" onClose={vi.fn()} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("fixed");
  });

  it("success type does not apply red styles", () => {
    const { container } = render(
      <Toast message="OK" type="success" onClose={vi.fn()} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toContain("red-50");
  });

  it("error type does not apply green styles", () => {
    const { container } = render(
      <Toast message="Fail" type="error" onClose={vi.fn()} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toContain("green-50");
  });
});
