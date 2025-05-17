import { Footer2 } from "@/components/public/footer";
import { Navbar1 } from "@/components/public/header";
import { Hero1 } from "@/components/public/hero";
import { Stats8 } from "@/components/public/stats";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto p-4">
     <Navbar1 />
      {/** jumbotron */}
<Hero1 heading="Pareto AI Test" description="This is a test of the Pareto AI platform." />
      {/** features */}
      <Stats8 />
      {/** footer */}
      <Footer2 />
    </div>
  );
}
