"use client";

import React from 'react';
import {SignedOut, UserButton} from "@clerk/nextjs";
import {User} from "lucide-react";
import LoginButton from "@/app/(root)/_components/LoginButton";

const HeaderProfileBtn = () => {
    return (
        <>
            <UserButton>
                <UserButton.MenuItems>
                    <UserButton.Link
                        label="Profile"
                        labelIcon={<User className="size-4" />}
                        href="/profile"
                    />
                </UserButton.MenuItems>
            </UserButton>

            <SignedOut>
                <LoginButton />
            </SignedOut>
        </>
    );
};

export default HeaderProfileBtn;