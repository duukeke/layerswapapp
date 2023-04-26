import { Dispatch, SetStateAction, ReactNode, useRef } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { Leaflet } from "./leaflet";
import { ReactPortal } from "../Wizard/Widget";

export default function Popover({
    children,
    opener,
    align = "center",
    show,
    setShow,
}: {
    children: ReactNode;
    opener: ReactNode | string;
    align?: "center" | "start" | "end";
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
}) {
    const { isMobile, isDesktop } = useWindowDimensions();
    return (
        <>
            {isMobile && opener}
            {show && isMobile && (
                <ReactPortal>
                    <Leaflet position="fixed" height="fit" setShow={setShow} show={show}>{children}</Leaflet>
                </ReactPortal>
            )}
            {isDesktop && (
                <PopoverPrimitive.Root>
                    <PopoverPrimitive.Trigger className="inline-flex" asChild>
                        {opener}
                    </PopoverPrimitive.Trigger>
                    <PopoverPrimitive.Content
                        sideOffset={4}
                        align={align}
                        className="z-20 animate-slide-up-fade items-center rounded-md bg-darkblue-900 border-2 border-darkblue-500 drop-shadow-lg"
                    >
                        {show && children}
                    </PopoverPrimitive.Content>
                </PopoverPrimitive.Root>
            )}
        </>
    );
}