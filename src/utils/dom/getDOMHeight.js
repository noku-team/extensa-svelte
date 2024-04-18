const getDOMHeight = (windowHeight, forceCalculatedHeight) => {
    let height = windowHeight;
    if (forceCalculatedHeight) height = height - forceCalculatedHeight;
    else {
        const navbar = document.getElementById('header');
        if (navbar) {
            const navbarHeight = navbar.offsetHeight;
            if (navbarHeight) {
                const calculatedHeight = height - navbarHeight;
                if (calculatedHeight > 1) {
                    height = calculatedHeight;
                }
            }
        }
    }

    return height;
};

export default getDOMHeight;