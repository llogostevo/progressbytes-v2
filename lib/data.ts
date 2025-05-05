import type { Topic, Question, Answer, Student } from "@/lib/types"
import {
  Network,
  Cpu,
  HardDrive,
  Shield,
  Settings,
  Globe,
  Code,
  FileCode,
  Puzzle,
  Binary,
  Terminal,
} from "lucide-react"

// Mock data store - this would be replaced by Supabase
const savedAnswers: Answer[] = []

// Current user - this would be replaced by authentication
export const currentUser: Student = {
  id: "user-1",
  email: "student@example.com",
  created_at: "2023-01-01T00:00:00Z",
  has_paid: false, // Set to false by default for the free version
}

// Toggle this function to simulate switching between free and paid versions
export function togglePaidStatus() {
  currentUser.has_paid = !currentUser.has_paid
  return currentUser.has_paid
}

// Mock topics data
export const topics: Topic[] = [
  // Unit 1
  {
    id: "1",
    slug: "systems-architecture",
    name: "Systems Architecture",
    description: "Learn about CPU architecture, fetch-execute cycle, and performance factors",
    icon: Cpu,
    questionCount: 23,
    questions: [
      {
        id: "q131",
        type: "short-answer",
        topic: "systems-architecture",
        question_text: "Outline the key steps involved in the CPU's fetch-decode-execute cycle.",
        model_answer: "1) The CPU uses the Program Counter to locate the next instruction.\n2) The instruction is fetched from memory and decoded by the Control Unit.\n3) The decoded instruction is then executed, potentially involving data processing by the ALU.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q132",
        type: "matching",
        topic: "systems-architecture",
        question_text: "Match each CPU register to its primary function:",
        pairs: [
          { statement: "Program Counter (PC)", match: "Holds the address of the next instruction to fetch" },
          { statement: "Memory Address Register (MAR)", match: "Stores the memory location to be accessed" },
          { statement: "Memory Data Register (MDR)", match: "Temporarily stores data being transferred to or from memory" },
          { statement: "Accumulator (ACC)", match: "Stores results from the ALU operations" }
        ],
        model_answer: [
          "Holds the address of the next instruction to fetch",
          "Stores the memory location to be accessed",
          "Temporarily stores data being transferred to or from memory",
          "Stores results from the ALU operations"
        ],
        explanation: "Registers store temporary data or addresses that are used during instruction processing. Each has a distinct role in keeping the CPU operating efficiently.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q133",
        type: "short-answer",
        topic: "systems-architecture",
        question_text: "Identify three CPU characteristics that influence processing speed.",
        model_answer: "1) Clock speed\n2) Cache memory size\n3) Number of processing cores",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q134",
        type: "short-answer",
        topic: "systems-architecture",
        question_text: "Why is a car’s cruise control considered an embedded system?",
        model_answer: "It performs one specific task (maintaining vehicle speed), is built into the vehicle, and operates with its own microcontroller and software that can't be easily changed.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q135",
        type: "short-answer",
        topic: "systems-architecture",
        question_text: "Provide an example of an embedded system found in vehicles and explain its purpose.",
        model_answer: "Example: Parking sensors.\nExplanation: These detect nearby obstacles and alert the driver. The system is purpose-built and works automatically using embedded software.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q136",
        type: "matching",
        topic: "systems-architecture",
        question_text: "Match the CPU component to what it does:",
        pairs: [
          { statement: "Program Counter", match: "Tracks the address of the instruction to be fetched next" },
          { statement: "Control Unit", match: "Controls the timing and flow of instructions in the CPU" },
          { statement: "Memory Address Register", match: "Holds the address in memory to read from or write to" },
          { statement: "Arithmetic Logic Unit", match: "Carries out calculations and logical operations" }
        ],
        model_answer: [
          "Tracks the address of the instruction to be fetched next",
          "Controls the timing and flow of instructions in the CPU",
          "Holds the address in memory to read from or write to",
          "Carries out calculations and logical operations"
        ],
        explanation: "These components each contribute to processing data and instructions. The CU manages flow, the ALU handles logic, and registers help manage addresses and results.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q137",
        type: "true-false",
        topic: "systems-architecture",
        question_text: "The CPU's cache stores frequently used instructions and data to reduce access times.",
        model_answer: "true",
        explanation: "True – Cache memory holds recently accessed data or instructions so the CPU can reuse them quickly without fetching from slower main memory.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q138",
        type: "multiple-choice",
        topic: "systems-architecture",
        question_text: "Which of the following changes is most likely to speed up a CPU’s performance?",
        options: [
          "Reducing the number of cores",
          "Lowering the cache size",
          "Using a higher clock speed",
          "Running fewer background apps"
        ],
        correctAnswerIndex: 2,
        model_answer: "Using a higher clock speed",
        explanation: "Increasing clock speed means the CPU can execute more instructions per second, improving performance for most tasks.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q139",
        type: "multiple-choice",
        topic: "systems-architecture",
        question_text: "Which component in the CPU is responsible for handling logical operations such as AND, OR, and NOT?",
        options: [
          "Control Unit",
          "Cache",
          "Accumulator",
          "Arithmetic Logic Unit"
        ],
        correctAnswerIndex: 3,
        model_answer: "Arithmetic Logic Unit",
        explanation: "The ALU is responsible for performing arithmetic and logical operations like AND, OR, and NOT.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q140",
        type: "true-false",
        topic: "systems-architecture",
        question_text: "The Program Counter holds data being processed in the CPU.",
        model_answer: "false",
        explanation: "False – the Program Counter holds the memory address of the next instruction to fetch, not the data being processed.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q141",
        type: "multiple-choice",
        topic: "systems-architecture",
        question_text: "Which of these is an embedded system in a home environment?",
        options: ["Smart light switch", "Web browser", "Laptop", "Spreadsheet software"],
        correctAnswerIndex: 0,
        model_answer: "Smart light switch",
        explanation: "A smart light switch is an embedded system designed for a specific task: controlling lighting, usually with minimal hardware and limited software.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q142",
        type: "true-false",
        topic: "systems-architecture",
        question_text: "Embedded systems usually run many complex tasks at once.",
        model_answer: "false",
        explanation: "False – embedded systems are built to perform specific tasks efficiently and usually run only one or a few simple tasks.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q143",
        type: "short-answer",
        topic: "systems-architecture",
        question_text: "Explain why a washing machine includes an embedded system.",
        model_answer: "The embedded system controls the washing cycle, water level, and temperature. It's dedicated to this task and is not a general-purpose computer.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q131",
        type: "short-answer",
        topic: "systems-architecture",
        question_text: "Outline the key steps involved in the CPU's fetch-decode-execute cycle.",
        model_answer: "1) The CPU uses the Program Counter to locate the next instruction.\n2) The instruction is fetched from memory and decoded by the Control Unit.\n3) The decoded instruction is then executed, potentially involving data processing by the ALU.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q132",
        type: "matching",
        topic: "systems-architecture",
        question_text: "Match each CPU register to its primary function:",
        pairs: [
          { statement: "Program Counter (PC)", match: "Holds the address of the next instruction to fetch" },
          { statement: "Memory Address Register (MAR)", match: "Stores the memory location to be accessed" },
          { statement: "Memory Data Register (MDR)", match: "Temporarily stores data being transferred to or from memory" },
          { statement: "Accumulator (ACC)", match: "Stores results from the ALU operations" }
        ],
        model_answer: [
          "Holds the address of the next instruction to fetch",
          "Stores the memory location to be accessed",
          "Temporarily stores data being transferred to or from memory",
          "Stores results from the ALU operations"
        ],
        explanation: "Registers store temporary data or addresses that are used during instruction processing. Each has a distinct role in keeping the CPU operating efficiently.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q133",
        type: "short-answer",
        topic: "systems-architecture",
        question_text: "Identify three CPU characteristics that influence processing speed.",
        model_answer: "1) Clock speed\n2) Cache memory size\n3) Number of processing cores",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q144",
        type: "short-answer",
        topic: "systems-architecture",
        question_text: "Explain how increasing the number of CPU cores can affect performance.",
        model_answer: "More cores allow the CPU to carry out multiple tasks at the same time (parallel processing), improving performance for programs designed to take advantage of this.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q145",
        type: "multiple-choice",
        topic: "systems-architecture",
        question_text: "Which change would typically improve CPU performance the most when running a single-threaded application?",
        options: ["Adding more cores", "Increasing cache size", "Increasing clock speed", "Installing more RAM"],
        correctAnswerIndex: 2,
        model_answer: "Increasing clock speed",
        explanation: "Clock speed determines how many instructions the CPU can process per second. For single-threaded applications, more cores won't help, but a higher clock speed will.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q146",
        type: "true-false",
        topic: "systems-architecture",
        question_text: "A higher clock speed always results in faster overall performance.",
        model_answer: "false",
        explanation: "False – While a higher clock speed can improve performance, other factors such as cooling, efficiency, and software optimization also play a role.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q147",
        type: "true-false",
        topic: "systems-architecture",
        question_text: "More CPU cache helps performance by reducing the time needed to access frequently used data.",
        model_answer: "true",
        explanation: "True – Cache memory is faster than main memory. More cache allows the CPU to store and quickly access more of the data it uses often.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q148",
        type: "short-answer",
        topic: "systems-architecture",
        question_text: "What is the benefit of a larger CPU cache size?",
        model_answer: "A larger cache can hold more frequently accessed instructions and data, reducing the need to fetch from slower main memory and speeding up overall performance.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q149",
        type: "multiple-choice",
        topic: "systems-architecture",
        question_text: "Which component directly stores data the CPU is likely to reuse?",
        options: ["RAM", "Register", "Cache", "Hard Drive"],
        correctAnswerIndex: 2,
        model_answer: "Cache",
        explanation: "Cache memory is closer to the CPU than RAM and is used to store frequently accessed data, reducing the time it takes to fetch instructions.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q150",
        type: "true-false",
        topic: "systems-architecture",
        question_text: "Adding more cores always improves program performance.",
        model_answer: "false",
        explanation: "False – Adding more cores can improve multitasking or performance for software designed to use them, but some programs can’t take advantage of multiple cores.",
        created_at: "2025-05-05T00:00:00Z"
      }
    ],
    unit: 1,
    disabled: false,
  },
  {
    id: "2",
    slug: "memory-storage",
    name: "Memory & Storage",
    description: "Explore primary and secondary storage, memory hierarchy, and data representation",
    icon: HardDrive,
    questionCount: 0,
    questions: [],
    unit: 1,
    disabled: true,
  },
  {
    id: "3",
    slug: "networks",
    name: "Computer Networks",
    description: "Explore network types, topologies, hardware, protocols, and internet communication",
    icon: Network,
    questionCount: 98,
    unit: 1,
    disabled: false,
    questions: [
      {
        id: "q1",
        topic: "networks",
        type: "text",
        question_text: "Define a computer network and give two reasons why they are used?",
        model_answer:
          "A computer network is a group of interconnected computer systems that communicate and share resources. The two main purposes of a network are to enable communication (e.g. emails, messaging) and to share resources such as files, printers, or internet connections.",
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "q2",
        topic: "networks",
        type: "text",
        question_text: "Describe the key differences between a LAN and a WAN.",
        model_answer:
          "A LAN (Local Area Network) connects devices over a small geographic area like a school or office and is usually owned and maintained by the organization. A WAN (Wide Area Network) connects devices over a large geographic area and often uses third-party infrastructure like ISPs.",
        created_at: "2023-01-02T00:00:00Z",
      },
      {
        id: "q3",
        topic: "networks",
        type: "text",
        question_text: "Compare a client-server network with a peer-to-peer network.",
        model_answer:
          "In a client-server network, a central server provides resources and services to clients. In a peer-to-peer network, devices share resources directly without a central server. Client-server networks are better for control and can be increased in size easily, while peer-to-peer networks are easier to set up.",
        created_at: "2023-01-04T00:00:00Z",
      },
      {
        id: "q4",
        topic: "networks",
        type: "text",
        question_text: "Give two advantages and two disadvantages of a client-server network.",
        model_answer:
          "Advantages: 1) Centralized control allows for easier management of backups and updates. 2) Resources like printers and files can be shared efficiently. Disadvantages: 1) If the server fails, the whole network may stop. 2) It may require dedicated IT staff to manage.",
        created_at: "2023-01-05T00:00:00Z",
      },
      {
        id: "q5",
        topic: "networks",
        type: "text",
        question_text: "Explain one advantage and one disadvantage of using a mesh topology.",
        model_answer:
          "Advantage: Mesh topology is robust; if one connection fails, data can reroute via another path. Disadvantage: It can be expensive and complex due to the large number of cables and connections required, especially in a full mesh setup.",
        created_at: "2023-01-06T00:00:00Z",
      },
      {
        id: "q6",
        topic: "networks",
        type: "text",
        question_text: "State and explain three factors that can affect the performance of a network.",
        model_answer:
          "1) Bandwidth - limited bandwidth can slow data transfer. 2) Number of users - more users can cause congestion. 3) Interference - physical obstacles like walls can weaken wireless signals and reduce performance.",
        created_at: "2023-01-07T00:00:00Z",
      },
      {
        id: "q7",
        topic: "networks",
        type: "text",
        question_text: "What are the contents of a data packet?",
        model_answer:
          "A data packet contains a header (source and destination addresses, packet number, protocol), a payload (the actual data), and a trailer which may include a checksum to detect errors during transmission.",
        created_at: "2023-01-08T00:00:00Z",
      },
      {
        id: "q8",
        topic: "networks",
        type: "text",
        question_text: "Describe how a star topology functions and one of its main advantages.",
        model_answer:
          "In a star topology, all devices are connected to a central hub or switch which manages communication. A key advantage is that if one connection fails, the rest of the network remains functional.",
        created_at: "2023-01-09T00:00:00Z",
      },
      {
        id: "q9",
        topic: "networks",
        type: "text",
        question_text: "Why might a business choose a star topology instead of a mesh topology?",
        model_answer:
          "A business might choose a star topology because it is simpler to install and maintain, requires less cabling than a mesh, and offers good performance with minimal data collisions. Mesh networks are more complex and expensive to set up.",
        created_at: "2023-01-10T00:00:00Z",
      },
      {
        id: "q10",
        topic: "networks",
        type: "text",
        question_text: "Explain how a switch works on a network.",
        model_answer:
          "A switch connects devices on a LAN and forwards data only to the intended recipient. It reads the destination MAC address in the packet header and uses its internal table of known addresses to send the data directly to the correct device, improving efficiency and security.",
        created_at: "2023-01-15T00:00:00Z",
      },
      {
        id: "q11",
        topic: "networks",
        type: "text",
        question_text: "What is the purpose of a router in a network?",
        model_answer:
          "A router directs data packets between different networks. It uses the IP address in the packet header and its routing table to determine the best path for the data to travel. Routers are essential for internet communication, connecting local networks to the wider internet.",
        created_at: "2023-01-16T00:00:00Z",
      },
      {
        id: "q12",
        topic: "networks",
        type: "text",
        question_text: "State what WAP stands for and explain its role in a network.",
        model_answer:
          "WAP stands for Wireless Access Point. It allows wireless devices to connect to a wired network, effectively creating a wireless LAN. WAPs are commonly used in homes, schools, and public places like airports or coffee shops to provide internet access.",
        created_at: "2023-01-17T00:00:00Z",
      },
      {
        id: "q13",
        topic: "networks",
        type: "text",
        question_text: "What is a NIC and why is it needed in a computer?",
        model_answer:
          "NIC stands for Network Interface Card. It is a piece of hardware that allows a computer to connect to a network. It contains a MAC address and provides a physical interface (such as an Ethernet port) for wired connections. Modern NICs are usually built into the motherboard.",
        created_at: "2023-01-18T00:00:00Z",
      },
      {
        id: "q14",
        topic: "networks",
        type: "text",
        question_text: "Describe the differences between three types of transmission media.",
        model_answer:
          "1) Ethernet cables (e.g. Cat5e, Cat6) are common in LANs and use electrical signals to transmit data. 2) Fibre optic cables transmit data as light, offering high speed and long distance, but are fragile and costly. 3) Coaxial cables are older, slower copper cables more prone to interference.",
        created_at: "2023-01-19T00:00:00Z",
      },
      {
        id: "q15",
        topic: "networks",
        type: "text",
        question_text: "What is the internet and how is it different from the World Wide Web?",
        model_answer:
          "The internet is a global network of interconnected networks that allows computers to communicate. The World Wide Web is a collection of websites and web pages accessed using the internet. The web uses protocols like HTTPS, but it is only one service that runs on the internet.",
        created_at: "2023-01-20T00:00:00Z",
      },
      {
        id: "q16",
        topic: "networks",
        type: "text",
        question_text: "What is web hosting and why is it necessary?",
        model_answer:
          "Web hosting is the service of storing website files on a server so they can be accessed via the internet. It is necessary because a website must be hosted on a web server to be publicly accessible. Hosting providers manage the server and make sure the site is always online.",
        created_at: "2023-01-21T00:00:00Z",
      },
      {
        id: "q17",
        topic: "networks",
        type: "text",
        question_text: "What is a DNS server and what role does it play in accessing websites?",
        model_answer:
          "A DNS (Domain Name System) server translates domain names like www.google.com into IP addresses like 142.250.72.196. This allows browsers to locate and connect to the correct server. DNS is essential for human-readable website navigation on the internet.",
        created_at: "2023-01-22T00:00:00Z",
      },
      {
        id: "q18",
        topic: "networks",
        type: "text",
        question_text: "Explain two advantages and two disadvantages of cloud storage.",
        model_answer:
          "Advantages: 1) Accessible from multiple devices with internet access. 2) Easy collaboration and large storage capacity. Disadvantages: 1) Requires a stable internet connection. 2) Data security concerns if the provider is hacked or suffers downtime.",
        created_at: "2023-01-24T00:00:00Z",
      },
      {
        id: "q19",
        topic: "networks",
        type: "text",
        question_text: "Explain the tasks a router performs when sending data across networks.",
        model_answer:
          "A router receives data packets and checks the destination IP address in the packet header. It uses its routing table to determine the best path to the destination network. The router then forwards the packet to the next router or the final destination.",
        created_at: "2023-01-25T00:00:00Z",
      },
      {
        id: "q20",
        topic: "networks",
        type: "text",
        question_text: "Explain the tasks a switch performs in a network.",
        model_answer:
          "A switch receives data packets from devices on the network. It reads the destination MAC address in the packet header, checks its MAC address table to find the correct port, and then forwards the packet to the appropriate device. This reduces unnecessary traffic and improves network performance.",
        created_at: "2023-01-26T00:00:00Z",
      },
      {
        id: "q21",
        topic: "networks",
        type: "text",
        question_text: "Explain the tasks a network interface card (NIC) performs in a computer system.",
        model_answer:
          "A NIC allows a computer to connect to a network by sending and receiving data. It formats data into packets, adds the device's MAC address, and handles the physical connection (e.g., through an Ethernet cable). It also receives packets from the network and passes them to the operating system for processing.",
        created_at: "2023-01-27T00:00:00Z",
      },
      {
        id: "q22",
        topic: "networks",
        type: "text",
        question_text: "What is a MAC address and why is it important on a LAN?",
        model_answer:
          "A MAC (Media Access Control) address is a unique 48-bit identifier assigned to each NIC. It is used on a LAN to identify individual devices. Switches use MAC addresses to send data directly to the correct device instead of broadcasting it to all devices on the network.",
        created_at: "2023-01-29T00:00:00Z",
      },
      {
        id: "q23",
        topic: "networks",
        type: "text",
        question_text: "Explain how a switch uses MAC addresses to forward data packets.",
        model_answer:
          "A switch maintains a table of MAC addresses and the port each device is connected to. When it receives a data packet, it checks the destination MAC address in the packet header, looks it up in the table, and forwards the packet to the correct port to reach the intended device.",
        created_at: "2023-01-30T00:00:00Z",
      },
      {
        id: "q24",
        topic: "networks",
        type: "text",
        question_text: "Describe how a router uses a routing table to send data across a WAN.",
        model_answer:
          "A router examines the destination IP address in a packet and checks its routing table for the best path. The routing table lists known networks and next-hop connections. The router forwards the packet to the next router or destination based on the best available route.",
        created_at: "2023-01-31T00:00:00Z",
      },
      {
        id: "q25",
        topic: "networks",
        type: "text",
        question_text: "What is latency and what causes it on a network?",
        model_answer:
          "Latency is the delay between sending and receiving data. It is caused by factors such as signal travel time, processing delays in routers, and queueing delays when packets wait to be handled. Satellite links, for example, have higher latency due to distance.",
        created_at: "2023-02-01T00:00:00Z",
      },
      {
        id: "q26",
        topic: "networks",
        type: "text",
        question_text: "Explain the difference between bandwidth and actual data transfer speed.",
        model_answer:
          "Bandwidth is the theoretical maximum rate of data transfer. Actual speed is often lower due to interference, congestion, and shared use. For example, wireless networks may offer high bandwidth but have slower real speeds because of signal loss or many users streaming video.",
        created_at: "2023-02-02T00:00:00Z",
      },
      {
        id: "q27",
        topic: "networks",
        type: "text",
        question_text: "What is the effect of increasing the number of active users on a network?",
        model_answer:
          "More active users can increase network congestion, especially if they are using bandwidth-heavy services like video streaming. While a network may handle many idle devices easily, performance slows when multiple users are actively transferring large amounts of data.",
        created_at: "2023-02-03T00:00:00Z",
      },
      {
        id: "q28",
        topic: "networks",
        type: "text",
        question_text: "Why are routers needed to connect different networks together?",
        model_answer:
          "Routers are needed to connect different networks because each network has its own IP address range. Routers inspect the destination IP address in each packet and decide the best path for delivery using a routing table, ensuring data reaches its destination even across the internet.",
        created_at: "2023-02-05T00:00:00Z",
      },
      {
        id: "q29",
        topic: "networks",
        type: "text",
        question_text: "Give the format of a MAC address.",
        model_answer:
          "A MAC address is 48 bits long and usually written in hexadecimal, split into six pairs separated by colons or dashes, like cd:f1:24:e4:89:a1.",
        created_at: "2023-02-07T00:00:00Z",
      },
      {
        id: "q30",
        topic: "networks",
        type: "text",
        question_text: "Give the format of an IPv4 address.",
        model_answer:
          "An IPv4 address is 32 bits long and written in dotted decimal notation, split into four numbers between 0 and 255, like 192.168.0.1.",
        created_at: "2023-02-08T00:00:00Z",
      },
      {
        id: "q31",
        topic: "networks",
        type: "text",
        question_text: "Give the format of an IPv6 address.",
        model_answer:
          "An IPv6 address is 128 bits long and written in hexadecimal, split into eight groups of four characters separated by colons, like 2001:0db8:85a3:0000:0000:8a2e:0370:7334.",
        created_at: "2023-02-09T00:00:00Z",
      },
      {
        id: "q32",
        topic: "networks",
        type: "text",
        question_text: "What is the difference between an IP address and a MAC address?",
        model_answer:
          "An IP address is a logical address used to identify a device on a network and can change. A MAC address is a unique physical address assigned to a device's NIC by the manufacturer and cannot be changed.",
        created_at: "2023-02-10T00:00:00Z",
      },
      {
        id: "q33",
        topic: "networks",
        type: "text",
        question_text: "Why was IPv6 developed?",
        model_answer:
          "IPv6 was developed because the internet was running out of IPv4 addresses. IPv6 uses 128-bit addresses, allowing for a much larger number of unique addresses.",
        created_at: "2023-02-11T00:00:00Z",
      },
      {
        id: "q34",
        topic: "networks",
        type: "text",
        question_text: "What does IP stand for and what is its purpose?",
        model_answer:
          "IP stands for Internet Protocol. It is used to assign logical addresses to devices and route data packets between them across networks.",
        created_at: "2023-02-12T00:00:00Z",
      },
      {
        id: "q35",
        topic: "networks",
        type: "text",
        question_text: "What is a protocol and why are protocols important in networking?",
        model_answer: "A protocol is a set of rules that define how data is transmitted and received over a network. Protocols are important because they ensure that devices from different manufacturers can communicate with each other reliably and efficiently.",
        created_at: "2024-06-09T00:00:00Z"
      },
      {
        id: "q36",
        topic: "networks",
        type: "text",
        question_text: "Devices in a local area network (LAN), are assigned IP and MAC addresses.\nProvide a valid example of an IPv4 address and one of an IPv6 address.",
        model_answer: "v4:\n• 4 groups of denary numbers between 0 and 255 separated by full stops (example v4: 123.16.46.72)\nv6:\n• 8 groups of hex numbers between 0 and FFFF separated by colons.\nDouble colon can appear once and replaces any number of groups of consecutive 0000 (example v6: 0252:5985:89ab:cdde:a57f:89ad:efcd:00fe)\n(example v6: F513:8C:2A::999:0000 expanded would be F513:8C:2A:0000:0000:0000:999:0000)",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q37",
        topic: "networks",
        type: "text",
        question_text: "Outline the structure of a MAC address.",
        model_answer: "• (usually presented in) hexadecimal / denary / binary\n• 6 groups of numbers / 12 (hex) numbers\n• … each group has paired/2-digit (hex) numbers / 8 bit binary number\n• 48 bits long\n• Separated by colons/hyphens\n• (The first half/part) contains the manufacturer ID / (first half/part) identifies the manufacturer\n• (The second half/part) contains the serial number / (second half/part) identifies the device",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q38",
        topic: "networks",
        type: "text",
        question_text: "A large organisation such as an airport uses wired connections in their LAN.\nGive two advantages of using wired connections for this type of environment.",
        model_answer: "• Fast connection/speed / high bandwidth / consistent bandwidth\n• … e.g. reduce delays at check in / by example for airport\n• Secure / unlikely to have unauthorised access/hacked / data transmissions are likely to be safe\n• … e.g. so that data about passengers/staff/aeroplanes is not intercepted / by example for airport\n• Little interference / little chance of data loss / reliable\n• … e.g. flight status is received without delay / by example for airport\n• Long range transmission\n• … e.g. airport has a large floor area/terminals / by example for airport",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q39",
        topic: "networks",
        type: "text",
        question_text: "Explain why a wireless connection could be beneficial in addition to a wired LAN in a busy workplace that covers a large building such as an airport or shopping centre.",
        model_answer: "• Staff do not need to be in one-place / movement of staff / can work whilst moving to another part of the airport / can be accessed from any location (in range)\n• Staff can be more responsive to customers/requests\n• Allows a larger number of connections/devices / more scalable …\n• … without the disruption/cost of installing more cables\n• Some devices do not allow physical/wired connection / allow wider range of type of device (or by example such as vehicles/mobile devices/aeroplanes)\n• Easier to add/connect more devices\n• Do not need to find/use a physical connection/wire / can allow you to connect in a place where there isn't a cable/connection\n• For use as a backup if the wired connection fails",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q40",
        topic: "networks",
        type: "text",
        question_text: "Compare one benefit and one disadvantage of using a star topology instead of a mesh topology in an office network.",
        model_answer: "Benefit e.g.\n• Easier to add new nodes / easier to setup BOD\n• Central device can monitor/control transmissions\n• Faster data transmission\n• Fewer data collisions\n• One connection/computer breaks the network still works\n• Less cost of cables\n\nDrawback e.g.\n• Switch fails the network fails / reliant on a central device (working) / single point of failure\n• Extra cost of central device/switch",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q41",
        topic: "networks",
        type: "text",
        question_text: "What is the function of the switch in a star network topology?",
        model_answer: "• Connects the devices together in the network / allows devices to communicate in the network\n• Receives data from (all) devices in the star topology\n• Record/register/store the address of devices connected to it …\n• … in a table\n• Uses MAC address of devices\n• Direct data to destination\n• … if address not recorded transmit to all devices",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q42",
        topic: "networks",
        type: "text",
        question_text: "A student is using a computer to carry out various tasks online.\n\nDifferent protocols are used to transmit data across the internet depending on the task.\nMatch the most suitable protocol to each of the following activities.\n\na. Accessing a news website\nb. Logging into an online banking account\nc. Downloading a file from a web server\nd. Receiving emails from a mail server",
        model_answer: "a HTTP / HTTPS\nb HTTPS\nc FTP / HTTP / HTTPS\nd IMAP / POP",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q43",
        topic: "networks",
        type: "text",
        question_text: "Describe two benefits of splitting network communication protocols into layers.",
        model_answer: "• Tasks can be assigned to different specialists\n• Reduces complexity by isolating responsibilities\n• Allows updates and improvements to be made to individual layers\n• Easier to standardise each part of the system\n• Encourages compatibility and flexibility",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q44",
        topic: "networks",
        type: "text",
        question_text: "State another feature of a Local Area Network (LAN), apart from operating in a small geographical area.",
        model_answer: "• Uses dedicated/own/internal hardware\n• Does not rely on third-party hardware/infrastructure\n• Devices use MAC addresses to communicate",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q45",
        topic: "networks",
        type: "text",
        question_text: "Describe the benefits of adding wireless connectivity to an existing wired home LAN.",
        model_answer: "• Allows more devices to connect (e.g. phones, smart TVs)\n• Easy to connect or set up new devices\n• Short-range wireless is suitable for home use\n• Devices can be used anywhere in the home\n• Avoids the need for trailing wires\n• Suitable for devices that only support wireless\n• Reduces physical damage risk to cables",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q46",
        topic: "networks",
        type: "text",
        question_text: "Identify two drawbacks of switching to wireless connections in a home LAN.",
        model_answer: "• Wireless is prone to interference\n• Limited signal range\n• Slower data transmission / less bandwidth\n• Higher chance of being hacked / lower security\n• Less stable / more dropouts\n• More collisions or errors possible",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q47",
        topic: "networks",
        type: "text",
        question_text: "A user uploads images to a website. Identify the client device and explain why it is considered the client.",
        model_answer: "• Client device: The user's computer\n• Sends the data/files to a server\n• Makes requests to the server (e.g. to upload files)\n• Does not store data for others\n• Receives confirmation or feedback from the server",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q48",
        topic: "networks",
        type: "text",
        question_text: "A user uploads images to a website. Identify the server device and explain why it is considered the server",
        model_answer: "• Server device: Web server\n• Stores the uploaded files\n• Processes or handles upload requests\n• Sends confirmations/errors back to client\n• Provides a hosted service",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q49",
        topic: "networks",
        type: "text",
        question_text: "Explain how having many connected devices at once can reduce network performance.",
        model_answer: "• More devices send more data, using up bandwidth\n• Bandwidth is shared, so each device gets less\n• Devices may wait longer before sending\n• Central hardware may become overloaded\n• More data collisions or retransmissions required",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q50",
        topic: "networks",
        type: "text",
        question_text: "Give one additional factor (not the number of devices) that can affect the overall performance of a network.",
        model_answer: "• Bandwidth\n• Transmission medium\n• Interference\n• Distance between devices\n• Type or amount of data\n• Performance of network hardware\n• Network topology",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q51",
        topic: "networks",
        type: "text",
        question_text: "Describe how a website is accessed refering to DNS and Web Servers.",
        model_answer: "• A website is hosted on a web server.\n• The computers that access the websites are called clients.\n• The user enters a Uniform Resource Locator (URL) into a web browser.\n• The web browser sends a request to the Domain Name Server (DNS) for the matching IP address.\n• If found, the IP address is returned.\n• A request is then sent to the IP address.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q52",
        topic: "networks",
        type: "text",
        question_text: "Explain why Ethernet is considered a networking standard.",
        model_answer: "• Widely adopted by manufacturers\n• Enables compatibility between devices\n• Reliable with high bandwidth\n• Has built-in security\n• Cost-effective to install and maintain",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q53",
        topic: "networks",
        type: "text",
        question_text: "List three functions that a router performs in a network.",
        model_answer: "• Receives and forwards packets\n• Maintains a routing table\n• Identifies efficient paths to destinations\n• Assigns IP addresses to devices\n• Converts packets between protocols",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q54",
        topic: "networks",
        type: "text",
        question_text: "Give two reasons why data transmitted through a network should be encrypted.",
        model_answer: "• Prevents intercepted data from being understood\n• Ensures only authorised users can access data\n• Helps meet data protection laws",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q55",
        topic: "networks",
        type: "text",
        question_text: "Identify a protocol used to send emails and one used to access websites securely.",
        model_answer: "• Send email: SMTP\n• Access website securely: HTTPS",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q56",
        topic: "networks",
        type: "text",
        question_text: "Amir's home includes laptops, phones, and TVs connected in a star network. What type of network is this?",
        model_answer: "• LAN (Local Area Network)",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q57",
        topic: "networks",
        type: "text",
        question_text: "Describe one similarity and one difference between a switch and a router.",
        model_answer: "Similarities:\n• Both connect devices\n• Both receive and transmit data\n\nDifferences:\n• Switch uses MAC addresses, router uses IP\n• Switch connects devices in a LAN, router connects networks\n• Router stores device addresses, switch learns addresses dynamically",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q58",
        topic: "networks",
        type: "text",
        question_text: "Give three advantages of storing files in the cloud.",
        model_answer: "• Accessible from any location\n• No need to carry physical storage\n• Backup and security managed by the provider",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q59",
        topic: "networks",
        type: "text",
        question_text: "State three disadvantages of using cloud storage.",
        model_answer: "• Requires internet access\n• Security and backup depend on the provider\n• Risk of data interception or loss of control",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q60",
        topic: "networks",
        type: "text",
        question_text: "Define the term 'network protocol'.",
        model_answer: "• A set of rules for communication between devices",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q61",
        topic: "networks",
        type: "text",
        question_text: "Define the term 'layer' in the context of network protocols.",
        model_answer: "• A section of the protocol model that performs a specific task in communication",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q62",
        topic: "networks",
        type: "text",
        question_text: "Explain one benefit of using layers in a protocol model.",
        model_answer: "• Each layer is self-contained and can be updated without affecting others\n• Developers can focus on specific layers\n• Promotes interoperability between systems",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q63",
        topic: "networks",
        type: "text",
        question_text: "Give two reasons a business might choose a star topology for their LAN.",
        model_answer: "• Easy to add or remove devices\n• Fewer collisions and better performance\n• Device failure doesn't bring down the whole network",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q64",
        topic: "networks",
        type: "text",
        question_text: "Define what a Wide Area Network (WAN) is.",
        model_answer: "• A network that connects devices across a large geographical area and does not rely on owned infrastructure",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q65",
        topic: "networks",
        type: "text",
        question_text: "Describe two benefits to a business of using cloud storage.",
        model_answer: "• Provides additional storage so they can scale up\n• Enables remote working\n• Reduces cost of in-house infrastructure\n• Includes automatic backups and security",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q66",
        topic: "networks",
        type: "text",
        question_text: "Give two disadvantages to a business of using cloud storage.",
        model_answer: "• Requires reliable internet access\n• Business remains responsible for data security\n• Data is stored externally, raising privacy concerns\n• Subject to data protection regulations",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q67",
        topic: "networks",
        type: "text",
        question_text: "Give two reasons why network protocols are designed in layers.",
        model_answer: "• Each layer works independently from the others\n• Changes can be made to one layer without affecting the rest\n• Developers can focus on a single layer\n• Layers group related tasks to make them easier to manage\n• Standardisation improves compatibility across systems",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q68",
        topic: "networks",
        type: "text",
        question_text: "Why is a layered model used when developing network communication systems? Give two reasons.",
        model_answer: "• Each layer can be updated or replaced without affecting the others\n• Protocols and hardware can be developed separately by different teams\n• Layers group related functions for better organisation\n• Hardware manufacturers can target specific layers\n• Simplifies development and maintenance",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q69",
        topic: "networks",
        type: "text",
        question_text: "State the purpose of a Network Interface Card (NIC) in a computer.",
        model_answer: "• Allows a computer to connect to a network\n• Converts data into signals suitable for transmission\n• Can be wired or wireless",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q70",
        topic: "networks",
        type: "text",
        question_text: "Identify one use of Bluetooth and one use of Wi-Fi. Explain why each is suitable for the task.",
        model_answer: "• Bluetooth - used for short-range connections like wireless headphones because it uses low power\n• Wi-Fi - used for internet access across a building because it covers a wider area",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q71",
        topic: "networks",
        type: "text",
        question_text: "Describe the function of a Wireless Access Point (WAP) in a network.",
        model_answer: "• Allows wireless devices to connect to a wired network\n• Transmits and receives data to/from wireless devices\n• Acts like a switch for wireless connections",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q72",
        topic: "networks",
        type: "text",
        question_text: "Give two examples of transmission media used in a network and describe one benefit of each.",
        model_answer: "• Copper cable - cheap and easy to install\n• Fibre optic cable - very high speed and long-distance transmission\n• Wireless - flexible and allows mobile access",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q73",
        topic: "networks",
        type: "multiple-choice",
        question_text: "What is the main purpose of a router in a network?",
        options: [
          "To connect devices within a LAN",
          "To connect different networks together",
          "To provide wireless access",
          "To store files and data"
        ],
        correctAnswerIndex: 1,
        model_answer: "A router's main purpose is to connect different networks together. It uses IP addresses to determine the best path for data to travel between networks.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q74",
        topic: "networks",
        type: "multiple-choice",
        question_text: "Which of the following is NOT a characteristic of a LAN?",
        options: [
          "Covers a small geographical area",
          "Uses dedicated hardware",
          "Requires third-party infrastructure",
          "Devices use MAC addresses to communicate"
        ],
        correctAnswerIndex: 2,
        model_answer: "A LAN does not require third-party infrastructure. It uses dedicated hardware owned by the organization and operates within a small geographical area.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q75",
        type: "fill-in-the-blank",
        topic: "networks",
        question_text: "A ______ network connects devices over a small geographical area, while a ______ network connects devices over a large geographical area.",
        model_answer: ["LAN", "WAN"],
        options: ["LAN", "WAN", "MAN", "PAN", "VPN", "SAN"],
        order_important: true,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q76",
        type: "fill-in-the-blank",
        topic: "networks",
        question_text: "In a star topology, all devices are connected to a central ______, while in a mesh topology, devices are connected to ______ other devices.",
        model_answer: ["switch", "multiple"],
        options: ["switch", "router", "hub", "multiple", "one", "none"],
        order_important: true,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q77",
        type: "fill-in-the-blank",
        topic: "networks",
        question_text: "A ______ address is a unique 48-bit identifier for a network interface card, while an ______ address is a logical address used for routing data across networks.",
        model_answer: ["MAC", "IP"],
        options: ["MAC", "IP", "DNS", "URL", "FTP", "HTTP"],
        order_important: true,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q78",
        type: "fill-in-the-blank",
        topic: "networks",
        question_text: "The ______ protocol is used for secure web browsing, while the ______ protocol is used for sending emails.",
        model_answer: ["HTTPS", "SMTP"],
        options: ["HTTPS", "SMTP", "FTP", "HTTP", "POP3", "IMAP"],
        order_important: true,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q79",
        type: "fill-in-the-blank",
        topic: "networks",
        question_text: "A ______ converts domain names to IP addresses, while a ______ forwards data packets between networks.",
        model_answer: ["DNS server", "router"],
        options: ["DNS server", "router", "switch", "hub", "modem", "firewall"],
        order_important: true,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q80",
        type: "fill-in-the-blank",
        topic: "networks",
        question_text: "______ cables use light to transmit data, while ______ cables use electrical signals.",
        model_answer: ["Fibre optic", "copper"],
        options: ["Fibre optic", "copper", "wireless", "coaxial", "ethernet", "twisted pair"],
        order_important: true,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q81",
        type: "fill-in-the-blank",
        topic: "networks",
        question_text: "In a client-server network, the ______ provides services and resources, while the ______ requests and uses these services.",
        model_answer: ["server", "client"],
        options: ["server", "client", "router", "switch", "hub", "modem"],
        order_important: true,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q82",
        type: "fill-in-the-blank",
        topic: "networks",
        question_text: "______ is the delay in data transmission, while ______ is the maximum rate of data transfer.",
        model_answer: ["Latency", "bandwidth"],
        options: ["Latency", "bandwidth", "throughput", "speed", "capacity", "frequency"],
        order_important: true,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q83",
        topic: "networks",
        type: "multiple-choice",
        question_text: "Which of the following best describes a Local Area Network (LAN)?",
        options: [
          "A network that connects devices across multiple countries",
          "A network that connects devices within a single building or site",
          "A network that uses only wireless connections",
          "A network that requires third-party infrastructure"
        ],
        correctAnswerIndex: 1,
        model_answer: "A LAN connects devices within a small geographical area like a single building or site, using dedicated hardware owned by the organization.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q84",
        topic: "networks",
        type: "multiple-choice",
        question_text: "What is the main advantage of a star topology over a mesh topology?",
        options: [
          "It requires less cabling",
          "If one connection fails, the rest of the network continues to work",
          "It is easier to set up",
          "It has faster data transmission speeds"
        ],
        correctAnswerIndex: 1,
        model_answer: "In a star topology, if one connection fails, only that device is affected while the rest of the network continues to function normally.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q85",
        topic: "networks",
        type: "multiple-choice",
        question_text: "Which device is responsible for forwarding data packets between different networks?",
        options: [
          "Switch",
          "Hub",
          "Router",
          "Network Interface Card"
        ],
        correctAnswerIndex: 2,
        model_answer: "A router is specifically designed to forward data packets between different networks using IP addresses to determine the best path.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q86",
        topic: "networks",
        type: "multiple-choice",
        question_text: "What is the purpose of a MAC address?",
        options: [
          "To identify a device on the internet",
          "To identify a device on a local network",
          "To encrypt data transmissions",
          "To store website addresses"
        ],
        correctAnswerIndex: 1,
        model_answer: "A MAC address is a unique 48-bit identifier assigned to a network interface card, used to identify devices on a local network.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q87",
        topic: "networks",
        type: "multiple-choice",
        question_text: "Which protocol is used to securely transmit web pages?",
        options: [
          "HTTP",
          "FTP",
          "HTTPS",
          "SMTP"
        ],
        correctAnswerIndex: 2,
        model_answer: "HTTPS (Hypertext Transfer Protocol Secure) encrypts data between the web browser and server, providing secure communication.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q88",
        topic: "networks",
        type: "multiple-choice",
        question_text: "What is the main advantage of using fibre optic cables over copper cables?",
        options: [
          "They are cheaper to install",
          "They are more flexible",
          "They provide higher bandwidth and longer transmission distances",
          "They are easier to repair"
        ],
        correctAnswerIndex: 2,
        model_answer: "Fibre optic cables use light to transmit data, allowing for much higher bandwidth and longer transmission distances compared to copper cables.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q89",
        topic: "networks",
        type: "multiple-choice",
        question_text: "In a client-server network, what is the role of the server?",
        options: [
          "To request services and resources",
          "To provide services and resources to clients",
          "To connect different networks together",
          "To convert domain names to IP addresses"
        ],
        correctAnswerIndex: 1,
        model_answer: "In a client-server network, the server provides services and resources (like files, applications, or web pages) to client devices that request them.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q90",
        topic: "networks",
        type: "multiple-choice",
        question_text: "What is the main difference between IPv4 and IPv6?",
        options: [
          "IPv6 is more secure than IPv4",
          "IPv6 addresses are shorter than IPv4 addresses",
          "IPv6 provides a much larger address space than IPv4",
          "IPv6 is only used for wireless networks"
        ],
        correctAnswerIndex: 2,
        model_answer: "IPv6 uses 128-bit addresses compared to IPv4's 32-bit addresses, providing a vastly larger number of possible unique addresses.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q91",
        topic: "networks",
        type: "multiple-choice",
        question_text: "Which of the following is NOT a factor that can affect network performance?",
        options: [
          "Number of users",
          "Bandwidth",
          "Type of operating system",
          "Transmission media"
        ],
        correctAnswerIndex: 2,
        model_answer: "The type of operating system does not directly affect network performance. Factors like number of users, bandwidth, and transmission media do affect performance.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q92",
        topic: "networks",
        type: "multiple-choice",
        question_text: "What is the purpose of a DNS server?",
        options: [
          "To store website content",
          "To convert domain names to IP addresses",
          "To provide wireless access",
          "To encrypt data transmissions"
        ],
        correctAnswerIndex: 1,
        model_answer: "A DNS (Domain Name System) server translates human-readable domain names (like www.example.com) into IP addresses that computers can use to locate servers.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q201",
        type: "true-false",
        topic: "networks",
        question_text: "A LAN covers a wide geographical area using infrastructure provided by third parties.",
        model_answer: "false",
        explanation: "False - A LAN (Local Area Network) covers a small geographical area and is typically managed by the organisation itself. A WAN covers a wider area and may use external infrastructure.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q202",
        type: "true-false",
        topic: "networks",
        question_text: "Switches help reduce network traffic by sending data only to the intended recipient.",
        model_answer: "true",
        explanation: "True - Switches examine the MAC address in each packet and forward it only to the intended device, reducing unnecessary traffic on the network.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q203",
        type: "true-false",
        topic: "networks",
        question_text: "Wi-Fi is a wired technology used in local area networks.",
        model_answer: "false",
        explanation: "False - Wi-Fi is a wireless technology that uses radio waves to connect devices in a local area network without physical cables.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q204",
        type: "true-false",
        topic: "networks",
        question_text: "DNS servers are used to translate domain names into IP addresses.",
        model_answer: "true",
        explanation: "True - DNS (Domain Name System) servers resolve human-readable domain names (like www.example.com) into numerical IP addresses needed for routing on the internet.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q205",
        type: "matching",
        topic: "networks",
        question_text: "Match the device to its function:",
        pairs: [
          { statement: "Switch", match: "Forwards data to specific devices on a LAN" },
          { statement: "Router", match: "Directs packets between different networks" },
          { statement: "Wireless Access Point", match: "Connects wireless devices to a network" },
          { statement: "NIC", match: "Allows a device to connect to a network" }
        ],
        model_answer: [
          "Forwards data to specific devices on a LAN",
          "Directs packets between different networks",
          "Connects wireless devices to a network",
          "Allows a device to connect to a network"
        ],
        explanation: "Each device serves a distinct purpose in a network. Switches manage traffic on a LAN; routers link different networks (e.g. LAN to WAN); WAPs connect wireless clients; NICs are essential for any device to communicate over a network.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q206",
        type: "matching",
        topic: "networks",
        question_text: "Match each network type to its description:",
        pairs: [
          { statement: "LAN", match: "Covers a small geographical area" },
          { statement: "WAN", match: "Connects devices over a large area" },
          { statement: "Client-server", match: "Relies on centralised servers" },
          { statement: "Peer-to-peer", match: "All devices share resources directly" }
        ],
        model_answer: [
          "Covers a small geographical area",
          "Connects devices over a large area",
          "Relies on centralised servers",
          "All devices share resources directly"
        ],
        explanation: "LANs are localised networks like those in schools. WANs span larger areas and use external infrastructure. Client-server networks centralise control, while peer-to-peer networks decentralise it, sharing responsibilities across devices.",
        created_at: "2025-05-05T00:00:00Z"
      }


    ],
  },
  {
    id: "4",
    slug: "network-security",
    name: "Network Security",
    description: "Learn about security threats, prevention methods, and encryption",
    icon: Shield,
    questionCount: 0,
    questions: [
      {
        id: "q151",
        type: "short-answer",
        topic: "network-security",
        question_text: "State what is meant by the term 'brute force attack' in the context of cyber security.",
        model_answer: "A brute force attack is when a hacker repeatedly tries different combinations of usernames and passwords to gain access to a system.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q152",
        type: "short-answer",
        topic: "network-security",
        question_text: "Explain one way that a brute force attack can be prevented.",
        model_answer: "By locking user accounts after a number of failed login attempts, or by requiring CAPTCHA or multi-factor authentication.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q153",
        type: "short-answer",
        topic: "network-security",
        question_text: "Give one reason why an organisation might perform penetration testing on their network.",
        model_answer: "To identify vulnerabilities or weaknesses that could be exploited by hackers before an actual attack occurs.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q154",
        type: "multiple-choice",
        topic: "network-security",
        question_text: "Which of the following is an example of social engineering?",
        options: [
          "Installing a firewall",
          "Sending a phishing email",
          "Using encryption",
          "Brute force password guessing"
        ],
        correctAnswerIndex: 1,
        model_answer: "Sending a phishing email",
        explanation: "Phishing is a form of social engineering that tricks users into revealing personal information by pretending to be a trustworthy source.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q155",
        type: "true-false",
        topic: "network-security",
        question_text: "Antivirus software is used to detect and remove malware.",
        model_answer: "true",
        explanation: "True – Antivirus software scans the system for known threats and helps remove or quarantine malware.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q156",
        type: "fill-in-the-blank",
        topic: "network-security",
        question_text: "Fill in the blanks:\n\nA ______ is a type of malware that disguises itself as a useful program. A ______ attack attempts to flood a server with requests. A ______ test checks for security flaws.",
        model_answer: ["Trojan", "Denial of Service", "penetration"],
        options: ["Trojan", "Worm", "Denial of Service", "phishing", "penetration", "debugging"],
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q157",
        type: "matching",
        topic: "network-security",
        question_text: "Match each security threat to its description:",
        pairs: [
          { statement: "Malware", match: "Software designed to damage or gain unauthorised access" },
          { statement: "Phishing", match: "Tricking users into revealing sensitive information" },
          { statement: "Denial of Service", match: "Flooding a network or server with traffic" },
          { statement: "Brute force", match: "Trying many passwords until the correct one is found" }
        ],
        model_answer: [
          "Software designed to damage or gain unauthorised access",
          "Tricking users into revealing sensitive information",
          "Flooding a network or server with traffic",
          "Trying many passwords until the correct one is found"
        ],
        explanation: "Each type of threat affects a system in a different way. Knowing these helps in choosing the right protection method.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q158",
        type: "short-answer",
        topic: "network-security",
        question_text: "Describe the purpose of network forensics.",
        model_answer: "Network forensics involves monitoring and analysing network traffic to detect and investigate security breaches or malicious activity.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q301",
        type: "short-answer",
        topic: "network-security",
        question_text: "Describe the purpose of a brute-force attack and how it operates.",
        model_answer: "A brute-force attack tries many combinations of passwords or pins until the correct one is found to gain access to a system.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q302",
        type: "short-answer",
        topic: "network-security",
        question_text: "Explain the role of social engineering in cyber attacks.",
        model_answer: "Social engineering manipulates people into giving away confidential information, such as passwords, often through fake phone calls or messages.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q303",
        type: "multiple-choice",
        topic: "network-security",
        question_text: "Which of the following best describes a denial-of-service (DoS) attack?",
        options: [
          "Stealing data from a system",
          "Cracking password hashes",
          "Flooding a network with traffic to cause disruption",
          "Injecting SQL code into a form field"
        ],
        correctAnswerIndex: 2,
        model_answer: "Flooding a network with traffic to cause disruption",
        explanation: "A DoS attack aims to overload services with requests, making them unavailable to users.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q304",
        type: "true-false",
        topic: "network-security",
        question_text: "Phishing is a form of malware that infects a user's device.",
        model_answer: "false",
        explanation: "Phishing is a form of social engineering, not malware. It tricks users into revealing personal information.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q305",
        type: "true-false",
        topic: "network-security",
        question_text: "Malware can be designed to encrypt files and demand payment for their release.",
        model_answer: "true",
        explanation: "This describes ransomware, a type of malware that locks files and demands payment to unlock them.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q306",
        type: "short-answer",
        topic: "network-security",
        question_text: "What is the goal of an SQL injection attack?",
        model_answer: "To access or manipulate a database by injecting malicious SQL code into an input field on a website.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q307",
        type: "short-answer",
        topic: "network-security",
        question_text: "Give one reason why people are often considered the weakest point in security.",
        model_answer: "People can be manipulated into revealing passwords or clicking on harmful links due to lack of awareness or poor training.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q308",
        type: "matching",
        topic: "network-security",
        question_text: "Match the attack type to its description:",
        pairs: [
          { "statement": "Phishing", "match": "Tricking someone into revealing information via email or message" },
          { "statement": "Brute-force", "match": "Guessing login details through repeated attempts" },
          { "statement": "SQL injection", "match": "Entering malicious database queries into a form" },
          { "statement": "DoS attack", "match": "Overloading a system to make it unavailable" }
        ],
        model_answer: [
          "Tricking someone into revealing information via email or message",
          "Guessing login details through repeated attempts",
          "Entering malicious database queries into a form",
          "Overloading a system to make it unavailable"
        ],
        explanation: "Each method targets different system weaknesses: users, login forms, databases, or services.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q309",
        type: "fill-in-the-blank",
        topic: "network-security",
        question_text: "Complete the sentence:\n\nOne way to protect against malware is to install ______ software. To reduce the risk of SQL injection, developers use ______ statements. A ______ is often used to restrict access between a device and the internet.",
        model_answer: ["anti-malware", "prepared", "firewall"],
        options: ["firewall", "encryption", "prepared", "raw", "password", "anti-malware"],
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q310",
        type: "short-answer",
        topic: "network-security",
        question_text: "Explain how encryption helps protect data in transmission.",
        model_answer: "Encryption scrambles data so that even if it's intercepted during transmission, it can't be understood without the correct decryption key.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q161",
        type: "multiple-choice",
        topic: "network-security",
        question_text: "What is the primary purpose of a denial-of-service (DoS) attack?",
        options: [
          "To access confidential data",
          "To overload a network and make it unavailable",
          "To gain physical access to a computer",
          "To trick users into giving passwords"
        ],
        correctAnswerIndex: 1,
        model_answer: "To overload a network and make it unavailable",
        explanation: "DoS attacks flood a network or service with requests, making it slow or entirely inaccessible to users.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q162",
        type: "true-false",
        topic: "network-security",
        question_text: "Firewalls can be used to block unauthorised access to a network.",
        model_answer: "true",
        explanation: "Firewalls act as barriers between trusted and untrusted networks, filtering traffic to prevent unauthorised access.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q163",
        type: "short-answer",
        topic: "network-security",
        question_text: "Give one reason why using strong, unique passwords is important for network security.",
        model_answer: "It makes it more difficult for attackers to gain unauthorised access through guessing or brute-force methods.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q164",
        type: "short-answer",
        topic: "network-security",
        question_text: "Explain how malware can be used to collect personal data from a user’s device.",
        model_answer: "Malware such as spyware can secretly monitor a user’s activity, capturing personal data like login credentials or financial information.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q165",
        type: "matching",
        topic: "network-security",
        question_text: "Match the attack type with its description:",
        pairs: [
          { "statement": "Phishing", "match": "Tricks users into revealing personal data" },
          { "statement": "Brute-force", "match": "Repeatedly tries passwords to gain access" },
          { "statement": "Malware", "match": "Software that damages or steals data" },
          { "statement": "SQL Injection", "match": "Alters database queries to access data" }
        ],
        model_answer: [
          "Tricks users into revealing personal data",
          "Repeatedly tries passwords to gain access",
          "Software that damages or steals data",
          "Alters database queries to access data"
        ],
        explanation: "Each form of attack works differently. Phishing uses deception, brute-force guesses logins, malware is malicious software, and SQL injection targets databases.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q166",
        type: "fill-in-the-blank",
        topic: "network-security",
        question_text: "Complete the following:\n\nA ______ is used to prevent unauthorised access to or from a private network. Anti-malware software helps detect and remove ______. Strong ______ help protect user accounts.",
        model_answer: ["firewall", "malware", "passwords"],
        options: ["firewall", "gateway", "malware", "spyware", "passwords", "keys"],
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q167",
        type: "multiple-choice",
        topic: "network-security",
        question_text: "Which of these best describes penetration testing?",
        options: [
          "Testing a website for speed and performance",
          "Simulating attacks to find vulnerabilities in a system",
          "Installing antivirus software on a server",
          "Changing default user passwords"
        ],
        correctAnswerIndex: 1,
        model_answer: "Simulating attacks to find vulnerabilities in a system",
        explanation: "Penetration testing involves authorised simulated attacks to identify weaknesses before a real attacker can exploit them.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q168",
        type: "true-false",
        topic: "network-security",
        question_text: "Encryption converts data into a readable format to make it easier to share.",
        model_answer: "false",
        explanation: "False – Encryption converts data into unreadable code to protect it from unauthorised access. Only those with the key can decrypt it.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q169",
        type: "short-answer",
        topic: "network-security",
        question_text: "Describe one way physical security can prevent unauthorised access to a network.",
        model_answer: "Physical security methods like locked server rooms or biometric access control limit who can access networking equipment.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q170",
        type: "short-answer",
        topic: "network-security",
        question_text: "What is a key feature of user access levels in a secure system?",
        model_answer: "User access levels restrict what data or functions users can access based on their role, reducing the risk of accidental or malicious changes.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q171",
        type: "multiple-choice",
        topic: "network-security",
        question_text: "Which of the following best describes the purpose of a firewall?",
        options: [
          "Encrypts sensitive data before storage",
          "Monitors and blocks unauthorised network access",
          "Detects and deletes all computer viruses",
          "Optimises network traffic for faster communication"
        ],
        correctAnswerIndex: 1,
        model_answer: "Monitors and blocks unauthorised network access",
        explanation: "A firewall helps protect a system or network by monitoring incoming and outgoing traffic and blocking suspicious or unauthorised connections.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q172",
        type: "true-false",
        topic: "network-security",
        question_text: "SQL injection involves inserting malicious code into a website’s database query.",
        model_answer: "true",
        explanation: "True – SQL injection is a form of attack where malicious SQL statements are inserted into a query to manipulate or access database information.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q173",
        type: "short-answer",
        topic: "network-security",
        question_text: "What is one way to prevent SQL injection attacks?",
        model_answer: "Use prepared statements or parameterised queries to ensure user input does not modify the structure of SQL commands.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q174",
        type: "matching",
        topic: "network-security",
        question_text: "Match each security measure to what it prevents or limits:",
        pairs: [
          { statement: "Firewall", match: "Unauthorised network access" },
          { statement: "Anti-malware software", match: "Malicious software infections" },
          { statement: "Password policy", match: "Unauthorised user logins" },
          { statement: "Encryption", match: "Access to data if intercepted" }
        ],
        model_answer: [
          "Unauthorised network access",
          "Malicious software infections",
          "Unauthorised user logins",
          "Access to data if intercepted"
        ],
        explanation: "Each method plays a key role in securing systems by preventing different types of attacks or minimising damage if they occur.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q175",
        type: "fill-in-the-blank",
        topic: "network-security",
        question_text: "Fill in the blanks about passwords and access control:\n\nTo limit access, users can be given different ______ levels. Strong ______ make it harder for attackers to guess or crack login details.",
        model_answer: ["access", "passwords"],
        options: ["access", "encryption", "passwords", "firewalls", "roles", "usernames"],
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q176",
        type: "short-answer",
        topic: "network-security",
        question_text: "Describe the purpose of penetration testing.",
        model_answer: "Penetration testing simulates an attack on a system to identify and fix vulnerabilities before they can be exploited by real attackers.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q177",
        type: "true-false",
        topic: "network-security",
        question_text: "Encryption can prevent data from being intercepted during transmission.",
        model_answer: "false",
        explanation: "False – Encryption doesn't prevent interception, but it makes the data unreadable without the correct key, thus protecting it.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q178",
        type: "multiple-choice",
        topic: "network-security",
        question_text: "Which of the following is an example of physical security?",
        options: [
          "Firewall",
          "Antivirus software",
          "Door lock on a server room",
          "Encryption"
        ],
        correctAnswerIndex: 2,
        model_answer: "Door lock on a server room",
        explanation: "Physical security refers to measures that prevent physical access to hardware and sensitive systems.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q179",
        type: "short-answer",
        topic: "network-security",
        question_text: "What is the role of access levels in improving security?",
        model_answer: "Access levels limit what actions users can perform and what data they can access, reducing the risk of accidental or malicious changes.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q180",
        type: "code",
        topic: "network-security",
        question_text: "The following SQL query is vulnerable to SQL injection:\n\n`SELECT * FROM users WHERE username = '\" + input + \"'`\n\nExplain how this could be exploited and suggest how to prevent it.",
        model_answer: "An attacker could input `' OR '1'='1` to return all records from the database. To prevent this, user input should be sanitised, or parameterised queries should be used instead.",
        model_answer_python: "cursor.execute(\"SELECT * FROM users WHERE username = ?\", (input_value,))",
        created_at: "2025-05-05T00:00:00Z"
      }
    ],
    unit: 1,
    disabled: true,
  },
  {
    id: "5",
    slug: "systems-software",
    name: "Systems Software",
    description: "Understand operating systems, utility software, and system management",
    icon: Settings,
    questionCount: 0,
    questions: [],
    unit: 1,
    disabled: true,
  },
  {
    id: "6",
    slug: "impacts",
    name: "Impacts",
    description: "Explore ethical, legal, cultural, and environmental impacts of technology",
    icon: Globe,
    questionCount: 0,
    questions: [],
    unit: 1,
    disabled: true,
  },

  // Unit 2
  {
    id: "7",
    slug: "algorithms",
    name: "Algorithms",
    description: "Learn about algorithms, computational thinking, and problem-solving",
    icon: Code,
    questionCount: 0,
    questions: [
    ],
    unit: 2,
    disabled: true,
  },
  {
    id: "8",
    slug: "programming-fundamentals",
    name: "Programming Fundamentals",
    description: "Master variables, data types, operators, and control structures",
    icon: FileCode,
    questionCount: 54,
    questions: [
      {
        id: "q83",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "A character moves along a straight path, and its current position is stored as an integer.\n\nThe character can move either left or right. Each move changes the position by 5 units:\n- Moving left subtracts 5 from the position\n- Moving right adds 5 to the position\n\nThe position must always stay between 1 and 512 inclusive.\n\nWrite a pseudocode function `moveCharacter()` that:\n• accepts `direction` (a string) and `position` (an integer) as parameters\n• adjusts the position based on the direction\n• ensures the new position stays within the range 1 to 512\n• returns the new position",
        model_answer: "function moveCharacter(direction, position)\n   if direction == \"left\" then\n      position = position - 5\n   elseif direction == \"right\" then\n      position = position + 5\n   endif\n\n   if position < 1 then\n      position = 1\n   elseif position > 512 then\n      position = 512\n   endif\n\n   return position\nendfunction",
        model_answer_python: "def move_character(direction: str, position: int) -> int:\n    if direction == \"left\":\n        position -= 5\n    elif direction == \"right\":\n        position += 5\n\n    if position < 1:\n        position = 1\n    elif position > 512:\n        position = 512\n\n    return position",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q84",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "A program stores a user's score as an integer. If the score is divisible by 3, a bonus of 10 is added. If the score is even, it is doubled.\n\nWrite a pseudocode function `updateScore(score)` that:\n• takes `score` as a parameter\n• adds 10 if it is divisible by 3\n• doubles the score if it is even\n• returns the updated score",
        model_answer: "function updateScore(score)\n   if score MOD 3 == 0 then\n      score = score + 10\n   endif\n\n   if score MOD 2 == 0 then\n      score = score * 2\n   endif\n\n   return score\nendfunction",
        model_answer_python: "def update_score(score: int) -> int:\n    if score % 3 == 0:\n        score += 10\n\n    if score % 2 == 0:\n        score *= 2\n\n    return score",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q85",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user to input a number\n• repeats this until the user inputs a number greater than 100\n• prints 'Valid' once a number greater than 100 is entered",
        model_answer: "number = 0\nwhile number <= 100\n   number = input(\"Enter a number greater than 100: \"\nendwhile\nprint(\"Valid\")",
        model_answer_python: "number = 0\nwhile number <= 100:\n    number = int(input(\"Enter a number greater than 100: \"))\nprint(\"Valid\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q86",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode function `checkAge(age)` that:\n• takes `age` as an integer parameter\n• prints 'Child' if age is less than 13\n• prints 'Teen' if age is between 13 and 19 inclusive\n• prints 'Adult' otherwise",
        model_answer: "function checkAge(age)\n   if age < 13 then\n      print(\"Child\")\n   elseif age >= 13 AND age <= 19 then\n      print(\"Teen\")\n   else\n      print(\"Adult\")\n   endif\nendfunction",
        model_answer_python: "def check_age(age: int) -> None:\n    if age < 13:\n        print(\"Child\")\n    elif 13 <= age <= 19:\n        print(\"Teen\")\n    else:\n        print(\"Adult\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q87",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode function `calculatePower(base, exponent)` that:\n• takes two integer parameters\n• uses a loop to calculate and return `base` to the power of `exponent` without using ^",
        model_answer: "function calculatePower(base, exponent)\n   result = 1\n   for i = 1 to exponent\n      result = result * base\n   next i\n   return result\nendfunction",
        model_answer_python: "def calculate_power(base: int, exponent: int) -> int:\n    result = 1\n    for i in range(exponent):\n        result *= base\n    return result",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q88",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode procedure `greetUser(name)` that:\n• takes a name as a parameter\n• prints 'Hello' followed by the name\n• prints 'Welcome to the system'",
        model_answer: "procedure greetUser(name)\n   print(\"Hello \" + name)\n   print(\"Welcome to the system\")\nendprocedure",
        model_answer_python: "def greet_user(name: str) -> None:\n    print(f\"Hello {name}\")\n    print(\"Welcome to the system\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q89",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode procedure `countdown(n)` that:\n• takes an integer parameter\n• prints each number from n to 1\n• prints 'Go!' at the end",
        model_answer: "procedure countdown(n)\n   for i = n to 1 step -1\n      print(i)\n   next i\n   print(\"Go!\")\nendprocedure",
        model_answer_python: "def countdown(n: int) -> None:\n    for i in range(n, 0, -1):\n        print(i)\n    print(\"Go!\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q90",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode procedure `printMultiples(n)` that:\n• takes a number n\n• prints the first 5 multiples of n (n, 2n, 3n, 4n, 5n)",
        model_answer: "procedure printMultiples(n)\n   for i = 1 to 5\n      print(n * i)\n   next i\nendprocedure",
        model_answer_python: "def print_multiples(n: int) -> None:\n    for i in range(1, 6):\n        print(n * i)",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q91",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode procedure `printRange(startNum, endNum)` that:\n• prints each integer between startNum and endNum inclusive\n• prints 'Done' when finished",
        model_answer: "procedure printRange(startNum, endNum)\n   for i = startNum to endNum\n      print(i)\n   next i\n   print(\"Done\")\nendprocedure",
        model_answer_python: "def print_range(start_num: int, end_num: int) -> None:\n    for i in range(start_num, end_num + 1):\n        print(i)\n    print(\"Done\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q92",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user to enter an integer\n• prints 'Even' if the number is divisible by 2\n• prints 'Odd' otherwise",
        model_answer: "number = input(\"Enter a number: \"\nif number MOD 2 == 0 then\n   print(\"Even\")\nelse\n   print(\"Odd\")\nendif",
        model_answer_python: "number = int(input(\"Enter a number: \"))\nif number % 2 == 0:\n    print(\"Even\")\nelse:\n    print(\"Odd\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q93",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user for a test score\n• prints 'Pass' if the score is 50 or more\n• prints 'Fail' if the score is less than 50",
        model_answer: "score = input(\"Enter test score: \"\nif score >= 50 then\n   print(\"Pass\")\nelse\n   print(\"Fail\")\nendif",
        model_answer_python: "score = int(input(\"Enter test score: \"))\nif score >= 50:\n    print(\"Pass\")\nelse:\n    print(\"Fail\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q94",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user to input two integers\n• prints the larger number",
        model_answer: "a = input(\"Enter first number: \"\nb = input(\"Enter second number: \"\nif a > b then\n   print(a)\nelse\n   print(b)\nendif",
        model_answer_python: "a = int(input(\"Enter first number: \"))\nb = int(input(\"Enter second number: \"))\nif a > b:\n    print(a)\nelse:\n    print(b)",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q95",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user to input a test score\n• prints 'A' if score is 80 or more\n• prints 'B' if score is 60-79\n• prints 'C' if score is 40-59\n• prints 'F' if score is less than 40",
        model_answer: "score = input(\"Enter score: \"\nif score >= 80 then\n   print(\"A\")\nelseif score >= 60 then\n   print(\"B\")\nelseif score >= 40 then\n   print(\"C\")\nelse\n   print(\"F\")\nendif",
        model_answer_python: "score = int(input(\"Enter score: \"))\nif score >= 80:\n    print(\"A\")\nelif score >= 60:\n    print(\"B\")\nelif score >= 40:\n    print(\"C\")\nelse:\n    print(\"F\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q96",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• repeatedly asks the user to enter a number\n• stops when the number entered is greater than 100\n• prints 'Done' at the end",
        model_answer: "number = 0\nwhile number <= 100\n   number = input(\"Enter a number: \"\nendwhile\nprint(\"Done\")",
        model_answer_python: "number = 0\nwhile number <= 100:\n    number = int(input(\"Enter a number: \"))\nprint(\"Done\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q97",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• repeatedly asks the user to enter a password\n• stops when the correct password 'letmein' is entered\n• prints 'Access granted'",
        model_answer: "password = \"\"\nwhile password != \"letmein\"\n   password = input(\"Enter password: \"\nendwhile\nprint(\"Access granted\")",
        model_answer_python: "password = \"\"\nwhile password != \"letmein\":\n    password = input(\"Enter password: \")\nprint(\"Access granted\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q98",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• starts with a counter at 10\n• prints the counter and decreases it by 1 each time\n• stops when the counter is less than 1",
        model_answer: "counter = 10\nwhile counter >= 1\n   print(counter)\n   counter = counter - 1\nendwhile",
        model_answer_python: "counter = 10\nwhile counter >= 1:\n    print(counter)\n    counter -= 1",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q99",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user to enter numbers\n• keeps a running total\n• stops when the user enters 0\n• prints the total",
        model_answer: "total = 0\nnumber = -1\nwhile number != 0\n   number = input(\"Enter number (0 to stop): \"\n   total = total + number\nendwhile\nprint(total)",
        model_answer_python: "total = 0\nnumber = -1\nwhile number != 0:\n    number = int(input(\"Enter number (0 to stop): \"))\n    total += number\nprint(total)",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q100",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• prints the numbers from 1 to 10 using a for loop",
        model_answer: "for i = 1 to 10\n   print(i)\nnext i",
        model_answer_python: "for i in range(1, 11):\n    print(i)",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q101",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user to enter a number\n• prints the 5 times table up to 12 using a for loop",
        model_answer: "number = input(\"Enter a number: \"\nfor i = 1 to 12\n   print(number * i)\nnext i",
        model_answer_python: "number = int(input(\"Enter a number: \"))\nfor i in range(1, 13):\n    print(number * i)",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q102",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• calculates the sum of numbers from 1 to 100 using a for loop\n• prints the total at the end",
        model_answer: "total = 0\nfor i = 1 to 100\n   total = total + i\nnext i\nprint(total)",
        model_answer_python: "total = 0\nfor i in range(1, 101):\n    total += i\nprint(total)",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q103",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• prints all even numbers from 2 to 20 using a for loop",
        model_answer: "for i = 2 to 20 step 2\n   print(i)\nnext i",
        model_answer_python: "for i in range(2, 21, 2):\n    print(i)",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q104",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user to enter their age as text\n• converts it to an integer\n• adds 1 to the age and prints it",
        model_answer: "ageText = input(\"Enter your age: \"))\nage = int(ageText)\nprint(age + 1)",
        model_answer_python: "age_text = input(\"Enter your age: \")\nage = int(age_text)\nprint(age + 1)",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q105",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user to input a whole number\n• converts the number to a string\n• prints a message including the number in a sentence",
        model_answer: "num = int(input(\"Enter a number: \"))\nmessage = \"You entered \" + str(num)\nprint(message)",
        model_answer_python: "num = int(input(\"Enter a number: \"))\nmessage = f\"You entered {num}\"\nprint(message)",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q106",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• stores a number with a decimal (e.g., 8.7)\n• casts it to an integer\n• prints both the original and the cast value",
        model_answer: "decimalNumber = 8.7\nwholeNumber = int(decimalNumber)\nprint(\"Original: \" + str(decimalNumber))\nprint(\"Whole: \" + str(wholeNumber))",
        model_answer_python: "decimal_number = 8.7\nwhole_number = int(decimal_number)\nprint(f\"Original: {decimal_number}\")\nprint(f\"Whole: {whole_number}\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q107",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user to enter two whole numbers\n• casts them to integers\n• divides the first by the second and prints the result as a real number",
        model_answer: "a = int(input(\"Enter first number: \"))\nb = int(input(\"Enter second number: \"))\nresult = a / b\nprint(result)",
        model_answer_python: "a = int(input(\"Enter first number: \"))\nb = int(input(\"Enter second number: \"))\nresult = a / b\nprint(result)",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q108",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user for two numbers\n• prints 'True' if both numbers are positive\n• otherwise prints 'False'",
        model_answer: "a = int(input(\"Enter first number: \"))\nb = int(input(\"Enter second number: \"))\nif a > 0 AND b > 0 then\n   print(\"True\")\nelse\n   print(\"False\")\nendif",
        model_answer_python: "a = int(input(\"Enter first number: \"))\nb = int(input(\"Enter second number: \"))\nif a > 0 and b > 0:\n    print(\"True\")\nelse:\n    print(\"False\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q109",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user to enter a number\n• prints 'In range' if the number is greater than 10 and less than 20",
        model_answer: "num = int(input(\"Enter a number: \"))\nif num > 10 AND num < 20 then\n   print(\"In range\")\nendif",
        model_answer_python: "num = int(input(\"Enter a number: \"))\nif 10 < num < 20:\n    print(\"In range\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q110",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user for a temperature\n• prints 'Warning' if the temperature is less than 0 or greater than 30",
        model_answer: "temp = int(input(\"Enter temperature: \"))\nif temp < 0 OR temp > 30 then\n   print(\"Warning\")\nendif",
        model_answer_python: "temp = int(input(\"Enter temperature: \"))\nif temp < 0 or temp > 30:\n    print(\"Warning\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q111",
        topic: "programming-fundamentals",
        type: "code",
        question_text: "Write a pseudocode program that:\n• asks the user to enter a username\n• prints 'Invalid' if the username is not 'admin'",
        model_answer: "username = input(\"Enter username: \"))\nif username != \"admin\" then\n   print(\"Invalid\")\nendif \n alternatively \n username = input(\"Enter username: \"))\nif NOT username == \"admin\" then\n   print(\"Invalid\")\nendif",
        model_answer_python: "username = input(\"Enter username: \")\nif username != \"admin\":\n    print(\"Invalid\")",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q117",
        type: "fill-in-the-blank",
        topic: "programming-fundamentals",
        question_text: "In programming, a ______ is used to store text, a ______ stores decimal values, and a ______ stores whole numbers.",
        model_answer: ["string", "real", "integer"],
        options: ["string", "boolean", "real", "character", "integer", "array"],
        order_important: true,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q118",
        type: "fill-in-the-blank",
        topic: "programming-fundamentals",
        question_text: "The three basic programming constructs are ______, ______, and ______.",
        model_answer: ["sequence", "selection", "iteration"],
        options: ["sequence", "selection", "iteration", "function", "procedure", "recursion"],
        order_important: false,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q119",
        type: "fill-in-the-blank",
        topic: "programming-fundamentals",
        question_text: "The arithmetic operators include ______, ______, ______, and ______.",
        model_answer: ["+", "-", "*", "/"],
        options: ["+", "-", "*", "/", "MOD", "DIV"],
        order_important: false,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q120",
        type: "fill-in-the-blank",
        topic: "programming-fundamentals",
        question_text: "To compare values, we use operators such as ______, ______, ______, and ______.",
        model_answer: ["==", "!=", ">", "<"],
        options: ["==", "!=", ">", "<", "*", "+"],
        order_important: false,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q121",
        type: "fill-in-the-blank",
        topic: "programming-fundamentals",
        question_text: "Boolean operators include ______, ______, and ______.",
        model_answer: ["AND", "OR", "NOT"],
        options: ["AND", "OR", "NOT", "MOD", "==", "input"],
        order_important: false,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q122",
        type: "fill-in-the-blank",
        topic: "programming-fundamentals",
        question_text: "To get input from a user, use the ______ function. To display output, use the ______ command. To store a value, use an ______ statement.",
        model_answer: ["input", "print", "assignment"],
        options: ["input", "print", "assignment", "loop", "constant", "output"],
        order_important: true,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q123",
        type: "fill-in-the-blank",
        topic: "programming-fundamentals",
        question_text: "The ______ loop repeats while a condition is true, the ______ loop repeats a set number of times, and the ______ structure chooses between options.",
        model_answer: ["while", "for", "if"],
        options: ["while", "for", "if", "case", "repeat", "break"],
        order_important: true,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q124",
        type: "fill-in-the-blank",
        topic: "programming-fundamentals",
        question_text: "To change data types, we can use ______ to convert to integer, ______ to convert to string, and ______ to convert to real number.",
        model_answer: ["int", "str", "float"],
        options: ["int", "str", "float", "bool", "char", "input"],
        order_important: true,
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q125",
        topic: "programming-fundamentals",
        type: "multiple-choice",
        question_text: "Which of the following is NOT a valid data type in programming?",
        options: [
          "string",
          "integer",
          "boolean",
          "decimal"
        ],
        correctAnswerIndex: 3,
        model_answer: "The correct term for decimal numbers is 'real' or 'float', not 'decimal'.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q126",
        topic: "programming-fundamentals",
        type: "multiple-choice",
        question_text: "What is the purpose of a while loop?",
        options: [
          "To execute code a specific number of times",
          "To execute code while a condition is true",
          "To execute code in parallel",
          "To execute code only once"
        ],
        correctAnswerIndex: 1,
        model_answer: "A while loop continues to execute its code block as long as the specified condition remains true.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q127",
        topic: "programming-fundamentals",
        type: "multiple-choice",
        question_text: "Which operator is used for integer division?",
        options: [
          "/",
          "//",
          "%",
          "*"
        ],
        correctAnswerIndex: 1,
        model_answer: "The // operator performs integer division, discarding any remainder.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q128",
        topic: "programming-fundamentals",
        type: "multiple-choice",
        question_text: "What is the purpose of the 'if' statement?",
        options: [
          "To repeat code multiple times",
          "To make decisions in code",
          "To define functions",
          "To handle errors"
        ],
        correctAnswerIndex: 1,
        model_answer: "The 'if' statement allows a program to make decisions by executing different code blocks based on conditions.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q129",
        topic: "programming-fundamentals",
        type: "multiple-choice",
        question_text: "Which of these is NOT a valid variable name?",
        options: [
          "myVariable",
          "2ndVariable",
          "user_name",
          "totalCount"
        ],
        correctAnswerIndex: 1,
        model_answer: "Variable names cannot start with a number. They must start with a letter or underscore.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q130",
        topic: "programming-fundamentals",
        type: "multiple-choice",
        question_text: "What is the purpose of a function?",
        options: [
          "To store data",
          "To repeat code",
          "To organize and reuse code",
          "To display output"
        ],
        correctAnswerIndex: 2,
        model_answer: "Functions allow code to be organized into reusable blocks that can be called multiple times.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q131",
        topic: "programming-fundamentals",
        type: "multiple-choice",
        question_text: "Which of these is a valid way to convert a string to an integer?",
        options: [
          "int('123')",
          "string_to_int('123')",
          "convert('123')",
          "to_integer('123')"
        ],
        correctAnswerIndex: 0,
        model_answer: "The int() function is used to convert a string to an integer in most programming languages.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q132",
        topic: "programming-fundamentals",
        type: "multiple-choice",
        question_text: "What is the purpose of the 'else' statement?",
        options: [
          "To handle errors",
          "To provide an alternative code path when the 'if' condition is false",
          "To repeat code",
          "To define variables"
        ],
        correctAnswerIndex: 1,
        model_answer: "The 'else' statement provides an alternative code block that executes when the 'if' condition is false.",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q301",
        type: "true-false",
        topic: "programming-fundamentals",
        question_text: "A variable is used to store data that can change while a program is running.",
        model_answer: "true",
        explanation: "True - A variable is a named storage location that holds a value which can be updated or changed during program execution.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q302",
        type: "true-false",
        topic: "programming-fundamentals",
        question_text: "The MOD operator performs division and returns the quotient.",
        model_answer: "false",
        explanation: "False - The MOD operator returns the remainder after division, not the quotient. The DIV operator gives the quotient.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q303",
        type: "true-false",
        topic: "programming-fundamentals",
        question_text: "A count-controlled loop uses a condition to decide when to stop.",
        model_answer: "false",
        explanation: "False - A count-controlled loop repeats a fixed number of times (e.g. FOR loops), whereas condition-controlled loops (like WHILE) stop when a condition is no longer true.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q304",
        type: "true-false",
        topic: "programming-fundamentals",
        question_text: "Selection allows a program to choose between different paths based on a condition.",
        model_answer: "true",
        explanation: "True - Selection, often implemented using IF or CASE statements, lets a program make decisions by evaluating conditions.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q305",
        type: "true-false",
        topic: "programming-fundamentals",
        question_text: "The assignment operator == is used to assign a value to a variable.",
        model_answer: "false",
        explanation: "False - The assignment operator is =. The double equals == is used for comparison, to check if two values are equal.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q306",
        type: "true-false",
        topic: "programming-fundamentals",
        question_text: "The Boolean operator AND returns true only if both conditions are true.",
        model_answer: "true",
        explanation: "True - AND evaluates to true only when both conditions are true. If either is false, the result is false.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q307",
        type: "true-false",
        topic: "programming-fundamentals",
        question_text: "Casting is the process of converting one data type into another.",
        model_answer: "true",
        explanation: "True - Casting changes a value from one type to another, such as converting a string into an integer using int().",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q308",
        type: "true-false",
        topic: "programming-fundamentals",
        question_text: "An IF statement must always include an ELSE clause.",
        model_answer: "false",
        explanation: "False - An IF statement can be used on its own. The ELSE clause is optional and only used if you want an alternative path.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q119",
        type: "code",
        topic: "programming-fundamentals",
        question_text: "Create an algorithm that:\n• Prompts for a staff ID and date of joining\n• Saves the input values to a file called staff.txt",
        model_answer: "staffID = input(\"Enter staff ID: \")\ndoj = input(\"Enter date of joining: \")\nfile = open(\"staff.txt\", \"a\")\nfile.write(staffID + ',' + doj + '\\n')\nfile.close()",
        model_answer_python: "staff_id = input(\"Enter staff ID: \")\ndoj = input(\"Enter date of joining: \")\nwith open('staff.txt', 'a') as file:\n    file.write(f\"{staff_id},{doj}\\n\")",
        created_at: "2025-05-05T00:00:00Z"
      },

    ],
    unit: 2,
    disabled: false,
  },
  {
    id: "9",
    slug: "robust-programs",
    name: "Producing Robust Programs",
    description: "Learn defensive design, testing, and maintenance techniques",
    icon: Puzzle,
    questionCount: 0,
    questions: [],
    unit: 2,
    disabled: true,
  },
  {
    id: "10",
    slug: "boolean-logic",
    name: "Boolean Logic",
    description: "Understand logic gates, truth tables, and Boolean expressions",
    icon: Binary,
    questionCount: 0,
    questions: [],
    unit: 2,
    disabled: true,
  },
  {
    id: "11",
    slug: "languages-and-idEs",
    name: "Languages & IDEs",
    description: "Explore programming languages, translators, and development environments",
    icon: Terminal,
    questionCount: 13,
    questions: [
      {
        id: "q117",
        type: "text",
        topic: "languages-and-idEs",
        question_text: "State two reasons why developers might choose to use a low-level language.",
        model_answer: "1) Provides faster execution and better performance.\n2) Enables precise control over system resources like memory and hardware.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q118",
        type: "short-answer",
        topic: "languages-and-idEs",
        question_text: "Explain why using a compiler can be beneficial compared to an interpreter.",
        model_answer: "Compiled programs run independently of the compiler and execute more quickly. They are also harder to reverse-engineer and allow error checking before execution.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q120",
        type: "short-answer",
        topic: "languages-and-idEs",
        question_text: "Give two reasons why a programmer might prefer to use a high-level language.",
        model_answer: "1) High-level code is easier to understand and maintain.\n2) High-level code is platform-independent and can be used on different systems.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q121",
        type: "matching",
        topic: "languages-and-idEs",
        question_text: "Match each characteristic with Compiler, Interpreter, or Both:",
        pairs: [
          { statement: "Changes source code to low-level instructions", match: "Both" },
          { statement: "Creates a file that runs on its own", match: "Compiler" },
          { statement: "Needs to retranslate each time the code runs", match: "Interpreter" }
        ],
        explanation: "Both compilers and interpreters convert source code into machine-readable instructions. A compiler translates the entire program at once and creates an executable file, whereas an interpreter re-translates code every time it runs, line-by-line.",
        model_answer: ["Both", "Compiler", "Interpreter"],
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q122",
        type: "matching",
        topic: "languages-and-idEs",
        question_text: "Match each description to either High-level or Low-level language:",
        pairs: [
          { statement: "Works on multiple types of computers", match: "High-level" },
          { statement: "Allows control of system memory directly", match: "Low-level" },
          { statement: "Easier to read using words like if and print", match: "High-level" },
          { statement: "Needs translation before it can run", match: "High-level" }
        ],
        explanation: "High-level languages are easier to write due to their English-like syntax. They are portable across different systems. Low-level languages, while harder to read, give direct control over memory and are tailored to specific hardware.",

        model_answer: ["High-level", "Low-level", "High-level", "High-level"],
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q123",
        type: "fill-in-the-blank",
        topic: "languages-and-idEs",
        question_text: "Complete the sentences about how code is executed:\n\nLena writes her program in a ______ language. This must be translated into machine code. An interpreter reads one line at a time and ______ when it encounters an error. A compiler creates an ______ file that can run ______ the compiler.",
        model_answer: ["high-level", "stops", "executable", "without"],
        options: ["high-level", "low-level", "stops", "continues", "executable", "debug", "without", "with"],
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q124",
        type: "short-answer",
        topic: "languages-and-idEs",
        question_text: "Why does high-level code need to be translated before it can run on a computer?",
        model_answer: "Because processors can only execute instructions written in binary machine code.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q125",
        type: "short-answer",
        topic: "languages-and-idEs",
        question_text: "Outline two key differences between how a compiler and an interpreter work.",
        model_answer: "1) A compiler translates all the code at once and saves a file to run later.\n2) An interpreter translates and runs each line individually and stops if an error occurs.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q126",
        type: "matching",
        topic: "languages-and-idEs",
        question_text: "Match each feature to High-level or Low-level language:",
        pairs: [
          { statement: "Includes commands like while and input", match: "High-level" },
          { statement: "Must be translated for the processor to understand", match: "High-level" },
          { statement: "Can be run on many types of computer hardware", match: "High-level" },
          { statement: "Needs knowledge of hardware architecture", match: "Low-level" }
        ],
        model_answer: ["High-level", "High-level", "High-level", "Low-level"],
        explanation: "High-level languages are easier to write due to their English like form. This makes them easier to maintain. They are also hardware-independent, as long as you have the translator they can be used on any machine/processor. Low-level languages require an understanding of processor structure and are more hardware-specific, this does make them more efficient in some cases as you can design specifically for that device, they might be used in embedded systems.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q127",
        type: "short-answer",
        topic: "languages-and-idEs",
        question_text: "Name two tools commonly available in a development environment (IDE).",
        model_answer: "1) Code editor - for writing and managing program code.\n2) Debugging tool - for finding and fixing issues in the code.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q128",
        type: "short-answer",
        topic: "languages-and-idEs",
        question_text: "List two features of an IDE that help when building a program to calculate a value.",
        model_answer: "1) Error detection features like syntax highlighting.\n2) The ability to run and test the program directly.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q129",
        type: "true-false",
        topic: "languages-and-idEs",
        question_text: "A compiler translates code line-by-line each time a program is run.",
        model_answer: "false",
        explanation: "A compiler translates the whole program into machine code before it runs. An interpreter is the tool that translates and executes code line-by-line during program execution.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q130",
        type: "multiple-choice",
        topic: "languages-and-idEs",
        question_text: "Why do computers need translators to run programs written in high-level languages?",
        options: [
          "High-level languages use too much memory",
          "Processors only understand binary instructions",
          "Compilers are faster than interpreters",
          "Code written by users needs to be checked"
        ],
        correctAnswerIndex: 1,
        explanation: "High-level languages use words and symbols that humans can understand but processors cannot. They must be translated into binary machine code using a compiler or interpreter so that the processor can execute the instructions.",
        model_answer: "Processors only understand binary instructions",
        created_at: "2025-05-05T00:00:00Z"
      }
    ],
    unit: 2,
    disabled: false,
  },
]



// Helper functions to interact with the mock data
export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((topic) => topic.slug === slug)
}

export function getRandomQuestionForTopic(topicSlug: string): Question {
  const topic = getTopicBySlug(topicSlug)
  if (!topic || topic.questions.length === 0) {
    throw new Error(`No questions found for topic: ${topicSlug}`)
  }

  const randomIndex = Math.floor(Math.random() * topic.questions.length)
  return topic.questions[randomIndex]
}

// Add this function to get a question by ID
export function getQuestionById(questionId: string): Question | undefined {
  // Search through all topics to find the question with the given ID
  for (const topic of topics) {
    const question = topic.questions.find((q) => q.id === questionId)
    if (question) {
      return question
    }
  }
  return undefined
}

export function saveAnswer(answer: Answer): void {
  savedAnswers.push(answer)

  // In a real app, this would be persisted to Supabase
  // For now, we're just storing in memory
  console.log("Answer saved:", answer)
}

export function getAllAnswers(): Answer[] {
  // Sort by most recent first
  return [...savedAnswers].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
}
