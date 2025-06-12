import LogoIamge from "../assets/logo.webp"

function Logo(){
    return <div className="p-4">
        <img src={LogoIamge} className="w-36"/>
        <span className="text-3xl font-extrabold">Chess<hr/>Analyzer</span>
    </div>
}

export default Logo