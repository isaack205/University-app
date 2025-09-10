import Header from './header.jsx';
import Footer from './footer.jsx';

export default function Layout ({ children }) {
    return (
        <div className='flex flex-col min-h-screen'>
            <Header/>
                <main className='flex-1'>
                    {children}
                </main>
            <Footer />
        </div>
    )
}
