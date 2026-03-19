import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmModal from "../../helpers/ConfirmModal";

describe("ConfirmModal component", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <ConfirmModal
        isOpen={false}
        title="¿Confirmar?"
        message="Esta acción es irreversible"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders title and message when isOpen is true", () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="¿Confirmar acción?"
        message="¿Estás seguro de que quieres continuar?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("¿Confirmar acción?")).toBeInTheDocument();
    expect(
      screen.getByText("¿Estás seguro de que quieres continuar?")
    ).toBeInTheDocument();
  });

  it("renders cancel and confirm buttons", () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Test"
        message="Test message"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Test"
        message="Message"
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    await userEvent.click(screen.getByText("Confirmar"));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Test"
        message="Message"
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />
    );

    await userEvent.click(screen.getByText("Cancelar"));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it("does not call onConfirm when cancel is clicked", async () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Test"
        message="Message"
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    await userEvent.click(screen.getByText("Cancelar"));
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it("applies red styles for confirmColor='red'", () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Eliminar"
        message="¿Eliminar?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        confirmColor="red"
      />
    );
    const confirmBtn = screen.getByText("Confirmar");
    expect(confirmBtn.className).toContain("red");
  });

  it("applies green styles for confirmColor='green'", () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Guardar"
        message="¿Guardar?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        confirmColor="green"
      />
    );
    const confirmBtn = screen.getByText("Confirmar");
    expect(confirmBtn.className).toContain("green");
  });

  it("defaults to green styling when confirmColor is not provided", () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Default"
        message="Test"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const confirmBtn = screen.getByText("Confirmar");
    expect(confirmBtn.className).toContain("green");
  });

  it("renders with modal overlay", () => {
    const { container } = render(
      <ConfirmModal
        isOpen={true}
        title="Test"
        message="Test"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain("fixed");
    expect(overlay.className).toContain("inset-0");
  });
});
