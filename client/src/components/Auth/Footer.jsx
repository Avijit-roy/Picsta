const Footer = () => {
    return (
        <>
            <div className="container flex-grow-1">{/* Your page content */}</div>
            <footer style={{ backgroundColor: '#F5F5F5' }} className=" ext-black border-top py-3 mt-auto">
                <div className="container text-center">
                    <p className="mb-1">© 2026 Avijit Roy</p>
                    <div>
                        <a href="#" className="text-black text-decoration-none mx-2">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-black text-decoration-none mx-2">
                            Contact
                        </a>
                    </div>
                </div>
            </footer>
            {/* Bootstrap JS (optional) */}
        </>



    )
}

export default Footer;