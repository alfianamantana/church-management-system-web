import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { usePopper } from 'react-popper';

const Dropdown = (props: any, forwardedRef: any) => {
    const [visibility, setVisibility] = useState<any>(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState<any>(false);

    const referenceRef = useRef<any>();
    const popperRef = useRef<any>();

    const { styles, attributes } = usePopper(referenceRef.current, popperRef.current, {
        placement: props.placement || 'bottom-end',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: props.offset || [(0)],
                },
            },
        ],
    });

    const handleDocumentClick = (event: any) => {
        if (referenceRef.current?.contains(event.target) || popperRef.current?.contains(event.target)) {
            return;
        }

        closeDropdown();
    };

    const closeDropdown = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            setVisibility(false);
            setIsAnimatingOut(false);
        }, 200); // Match Dropdowns duration
    };

    const toggleDropdown = () => {
        if (visibility) {
            closeDropdown();
        } else {
            setVisibility(true);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleDocumentClick);
        return () => {
            document.removeEventListener('mousedown', handleDocumentClick);
        };
    }, []);

    useImperativeHandle(forwardedRef, () => ({
        close() {
            closeDropdown();
        },
    }));

    return (
        <>
            <style>
                {`
                    @keyframes dropdown-enter {
                        from {
                            opacity: 0;
                            transform: scale(0.95) translateY(-8px);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }
                    @keyframes dropdown-exit {
                        from {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                        to {
                            opacity: 0;
                            transform: scale(0.95) translateY(-8px);
                        }
                    }
                    .dropdown-enter {
                        animation: dropdown-enter 0.2s ease-out forwards;
                    }
                    .dropdown-exit {
                        animation: dropdown-exit 0.2s ease-out forwards;
                    }
                `}
            </style>
            <button
                ref={referenceRef}
                type="button"
                className={props.btnClassName}
                onClick={toggleDropdown}
            >
                {props.button}
            </button>

            <div
                ref={popperRef}
                style={styles.popper}
                {...attributes.popper}
                className="z-50"
                onClick={toggleDropdown}
            >
                <div
                    className={`
                        ${visibility && !isAnimatingOut ? 'dropdown-enter' : ''}
                        ${isAnimatingOut ? 'dropdown-exit' : ''}
                    `}
                >
                    {visibility && props.children}
                </div>
            </div>

        </>
    );
};

export default forwardRef(Dropdown);
