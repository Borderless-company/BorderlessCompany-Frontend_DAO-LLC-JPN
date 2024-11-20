import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@nextui-org/react";
import { Logo } from "@/components/Logo";
import { AccountPlate } from "@/components/wallet/AccountPlate";

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
          <AccountPlate />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};
