import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@nextui-org/react";
import { Logo } from "@/components/Logo";
import WalletLogin from "./wallet/WalletLogin";

export const Header = () => {
  return (
    <Navbar>
      <NavbarBrand>
        <Link href="/">
          <Logo />
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <WalletLogin />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};
