import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { CancelInvoiceDialog } from "./CancelInvoiceDialog";

describe("CancelInvoiceDialog", () => {
  const mockOnConfirm = vi.fn();
  const mockOnOpenChange = vi.fn();
  const invoiceNumber = "INV-001";

  it("should render confirmation dialog when open", () => {
    const { getByText } = render(
      <CancelInvoiceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        invoiceNumber={invoiceNumber}
      />
    );

    expect(getByText(`Annuler la facture ${invoiceNumber}`)).toBeInTheDocument();
  });

  it("should display warning message about irreversibility", () => {
    const { getByText } = render(
      <CancelInvoiceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        invoiceNumber={invoiceNumber}
      />
    );

    expect(
      getByText(/Cette action est irréversible/i)
    ).toBeInTheDocument();
  });

  it("should provide a reason input field", () => {
    const { getByPlaceholderText } = render(
      <CancelInvoiceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        invoiceNumber={invoiceNumber}
      />
    );

    const reasonInput = getByPlaceholderText(/Entrez la raison de l'annulation/i);
    expect(reasonInput).toBeInTheDocument();
  });

  it("should have Confirm and Cancel buttons", () => {
    const { getByText } = render(
      <CancelInvoiceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        invoiceNumber={invoiceNumber}
      />
    );

    expect(getByText("Confirmer l'annulation")).toBeInTheDocument();
    expect(getByText("Annuler")).toBeInTheDocument();
  });

  it("should call onConfirm with reason when Confirm is clicked", async () => {
    const user = userEvent.setup();
    const { getByPlaceholderText, getByText } = render(
      <CancelInvoiceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        invoiceNumber={invoiceNumber}
      />
    );

    const reasonInput = getByPlaceholderText(/Entrez la raison de l'annulation/i);
    const confirmButton = getByText("Confirmer l'annulation");

    await user.type(reasonInput, "Test reason");
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledWith("Test reason");
  });

  it("should allow cancellation with empty reason", async () => {
    const user = userEvent.setup();
    const { getByText } = render(
      <CancelInvoiceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        invoiceNumber={invoiceNumber}
      />
    );

    const confirmButton = getByText("Confirmer l'annulation");
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledWith("");
  });

  it("should reset reason field after confirmation", async () => {
    const user = userEvent.setup();
    const { getByPlaceholderText, getByText, rerender } = render(
      <CancelInvoiceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        invoiceNumber={invoiceNumber}
      />
    );

    const reasonInput = getByPlaceholderText(/Entrez la raison de l'annulation/i) as HTMLTextAreaElement;
    const confirmButton = getByText("Confirmer l'annulation");

    await user.type(reasonInput, "Test reason");
    await user.click(confirmButton);

    // Reopen dialog
    rerender(
      <CancelInvoiceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        invoiceNumber={invoiceNumber}
      />
    );

    const newReasonInput = getByPlaceholderText(/Entrez la raison de l'annulation/i) as HTMLTextAreaElement;
    expect(newReasonInput.value).toBe("");
  });

  it("should reset reason field when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const { getByPlaceholderText, getByText } = render(
      <CancelInvoiceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        invoiceNumber={invoiceNumber}
      />
    );

    const reasonInput = getByPlaceholderText(/Entrez la raison de l'annulation/i);
    const cancelButton = getByText("Annuler");

    await user.type(reasonInput, "Test reason");
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
