import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { type ReactNode } from "react";

/** Gaveta de navegação no mobile (Radix Dialog para foco/esc/scroll-lock de graça). */
export function MobileMenu({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-border bg-surface focus:outline-none"
          aria-label="Navegação"
        >
          <VisuallyHidden>
            <Dialog.Title>Navegação</Dialog.Title>
          </VisuallyHidden>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
