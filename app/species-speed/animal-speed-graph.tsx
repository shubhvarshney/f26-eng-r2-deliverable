/* eslint-disable */
"use client";
import { useRef, useEffect, useState  } from "react";
import { select } from "d3-selection";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis"; // D3 is a JavaScript library for data visualization: https://d3js.org/
import { csv } from "d3-fetch";

// Example data: Only the first three rows are provided as an example
// Add more animals or change up the style as you desire

// Interface with the three main variables
interface AnimalDatum  {
  name: string;
  speed: number;
  diet: "herbivore" | "omnivore" | "carnivore";
}

export default function AnimalSpeedGraph() {
  // useRef creates a reference to the div where D3 will draw the chart.
  // https://react.dev/reference/react/useRef
  const graphRef = useRef<HTMLDivElement>(null);

  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);

  // Load CSV Data and parse into AnimalDatum
  useEffect(() => {
    csv("/sample_animals.csv").then((rows) => {
      const validDiets: AnimalDatum["diet"][] = ["herbivore", "omnivore", "carnivore"];
      // Repeat some of the cleaning here
      const parsedData = rows.flatMap((row) => {
        const speed = Number(row.speed);
        const diet = row.diet?.trim().toLowerCase();

        if (!row.name || !Number.isFinite(speed) || !validDiets.includes(diet ?? "")) {
          return [];
        }

        return [{ name: row.name, speed, diet: diet as AnimalDatum["diet"] }];
      });

      // Pick slowest, middle, and fastest animal for each diet
      const summaryData = validDiets.flatMap((diet) => {
        const animals = parsedData.filter((animal) => animal.diet === diet).sort((a, b) => a.speed - b.speed);
        const medianIndex = Math.floor((animals.length - 1) / 2);
        return [animals[0], animals[medianIndex], animals[animals.length - 1]].filter(
          (animal): animal is AnimalDatum => animal !== undefined,
        );
      });

      setAnimalData(summaryData);
    });
  }, []);

  useEffect(() => {
    // Clear any previous SVG to avoid duplicates when React hot-reloads
    if (graphRef.current) {
      graphRef.current.innerHTML = "";
    }

    if (animalData.length === 0) return;

    // Set up chart dimensions and margins
    const containerWidth = graphRef.current?.clientWidth ?? 800;
    const containerHeight = graphRef.current?.clientHeight ?? 500;

    // Set up chart dimensions and margins
    const width = Math.max(containerWidth, 600, animalData.length * 40 + 160); 
    const height = Math.max(containerHeight, 400); // Minimum height of 400px
    const margin = { top: 70, right: 60, bottom: 80, left: 100 };

    // Create the SVG element where D3 will draw the chart
    // https://github.com/d3/d3-selection
    const svg  = select(graphRef.current!)
      .append<SVGSVGElement>("svg")
      .attr("width", width)
      .attr("height", height);

    // Get the dimensions of just the chart
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Trnaslate the chart to account for the margins
    const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Get animal names into horizontal positions
    const x = scaleBand<string>()
      .domain(animalData.map((animal) => animal.name))
      .range([0, chartWidth])
      .padding(0.2);
    
    // Get animal speeds into vertical positions
    const y = scaleLinear()
      .domain([0, max(animalData, (animal) => animal.speed) ?? 0])
      .nice()
      .range([chartHeight, 0]);

    // Mapping diets to colors
    const color = scaleOrdinal<AnimalDatum["diet"], string>()
      .domain(["herbivore", "omnivore", "carnivore"])
      .range(["#2f855a", "#d69e2e", "#c53030"]);

    // X-axis
    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(axisBottom(x))
      .selectAll("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-35)");

    // Y-axis
    chart.append("g").call(axisLeft(y));

    // Draw the bars
    chart
      .selectAll("rect")
      .data(animalData)
      .join("rect")
      .attr("x", (animal) => x(animal.name) ?? 0)
      .attr("y", (animal) => Math.min(y(animal.speed), chartHeight - 3))
      .attr("width", x.bandwidth())
      .attr("height", (animal) => Math.max(3, chartHeight - y(animal.speed)))
      .attr("fill", (animal) => color(animal.diet));

    // Labeling speed
    chart
      .selectAll(".speed-label")
      .data(animalData)
      .join("text")
      .attr("class", "speed-label")
      .attr("x", (animal) => (x(animal.name) ?? 0) + x.bandwidth() / 2)
      .attr("y", (animal) => y(animal.speed) - 6)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .text((animal) => `${animal.speed} km/h`);

    // Axis Labels

    svg
      .append("text")
      .attr("x", margin.left + chartWidth / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Animal");
    svg
      .append("text")
      .attr("transform", `translate(20,${margin.top + chartHeight / 2}) rotate(-90)`)
      .attr("text-anchor", "middle")
      .text("Speed (km/h)");

    // Making a key to explain diet
    const legend = svg.append("g").attr("transform", `translate(${width - 250},25)`);
    ["herbivore", "omnivore", "carnivore"].forEach((diet, index) => {
      const item = legend.append("g").attr("transform", `translate(${index * 80},0)`);
      item
        .append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(diet as AnimalDatum["diet"]));
      item.append("text").attr("x", 16).attr("y", 10).style("font-size", "11px").text(diet);
    });

  }, [animalData]);

  // Return the graph
  return <div ref={graphRef} className="h-[500px] w-full overflow-x-auto" />;
}
