import { build } from "vite";

process.env.VITE_SITE_ORIGIN ||= "https://mysticmind.co.bw";
await build();
