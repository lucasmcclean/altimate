import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react";


const Switcher = () => {
  const accessibility_type_lower = ["img_alt", "img_contrast",  "page_contrast",  "page_navigation",  "page_skip_to_main"]
  const [accesibilityArr, setAccesibilityArr] = useState<string[]>([])
  const translate  = (untranslatedText: string) => {
      if(untranslatedText == "img_alt"){
        return "Alternative Image"
      }
      else if(untranslatedText == "img_contrast"){
        return "Image Contrast"
      }
      else if(untranslatedText == "page_contrast"){
        return "Page Contrast"
      }
      else if(untranslatedText == "page_navigation"){
        return "Page Navigation"
      }
      else{
        return "Skip to Main"
      }
  }

  const handleToggle = (id: string, checked: boolean) => {
    setAccesibilityArr((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    )
  }

  useEffect(() => {
    console.log(accesibilityArr)
  }, [accesibilityArr])


  return (

    <>
    <div className="flex flex-col justify-center items-center text-center h-screen w-screen">
       {accessibility_type_lower.map((atl, i) => (
      <div className="flex items-baseline space-x-2" key={i.toString()}>
      <Switch id="type-switch" checked={accesibilityArr.includes(atl)} onCheckedChange={(checked) => handleToggle(atl, checked)} />
      <Label htmlFor="type-switch">{translate(atl)}</Label>
    </div>
    ))}
    </div>
   
   
    </>
    
)
}

export default Switcher