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
    questionCount: 0,
    questions: [],
    unit: 1,
    disabled: true,
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
    questionCount: 43,
    unit: 1,
    disabled: false,
    questions: [
      {
        id: "q1",
        topic: "networks",
        question_text: "What is a computer network and what are its two main purposes?",
        model_answer:
          "A computer network is a group of interconnected computer systems that communicate and share resources. The two main purposes of a network are to enable communication (e.g. emails, messaging) and to share resources such as files, printers, or internet connections.",
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "q2",
        topic: "networks",
        question_text: "Describe the key differences between a LAN and a WAN.",
        model_answer:
          "A LAN (Local Area Network) connects devices over a small geographic area like a school or office and is usually owned and maintained by the organization. A WAN (Wide Area Network) connects devices over a large geographic area and often uses third-party infrastructure like ISPs.",
        created_at: "2023-01-02T00:00:00Z",
      },
      {
        id: "q3",
        topic: "networks",
        question_text: "Explain how data is transferred across a network using packets.",
        model_answer:
          "Data is broken into smaller units called packets. Each packet contains a header with addressing info, the payload (actual data), and a trailer with error-checking data. Routers direct packets across networks, possibly via different routes, and they are reassembled at the destination.",
        created_at: "2023-01-03T00:00:00Z",
      },
      {
        id: "q4",
        topic: "networks",
        question_text: "Compare a client-server network with a peer-to-peer network.",
        model_answer:
          "In a client-server network, a central server provides resources and services to clients. In a peer-to-peer network, devices share resources directly without a central server. Client-server networks are better for control and scalability, while peer-to-peer networks are easier to set up.",
        created_at: "2023-01-04T00:00:00Z",
      },
      {
        id: "q5",
        topic: "networks",
        question_text: "Give two advantages and two disadvantages of a client-server network.",
        model_answer:
          "Advantages: 1) Centralized control allows for easier management of backups and updates. 2) Resources like printers and files can be shared efficiently. Disadvantages: 1) If the server fails, the whole network may stop. 2) It may require dedicated IT staff to manage.",
        created_at: "2023-01-05T00:00:00Z",
      },
      {
        id: "q6",
        topic: "networks",
        question_text: "Explain one advantage and one disadvantage of using a mesh topology.",
        model_answer:
          "Advantage: Mesh topology is robust; if one connection fails, data can reroute via another path. Disadvantage: It can be expensive and complex due to the large number of cables and connections required, especially in a full mesh setup.",
        created_at: "2023-01-06T00:00:00Z",
      },
      {
        id: "q7",
        topic: "networks",
        question_text: "State and explain three factors that can affect the performance of a network.",
        model_answer:
          "1) Bandwidth – limited bandwidth can slow data transfer. 2) Number of users – more users can cause congestion. 3) Interference – physical obstacles like walls can weaken wireless signals and reduce performance.",
        created_at: "2023-01-07T00:00:00Z",
      },
      {
        id: "q8",
        topic: "networks",
        question_text: "What are the contents of a data packet?",
        model_answer:
          "A data packet contains a header (source and destination addresses, packet number, protocol), a payload (the actual data), and a trailer which may include a checksum to detect errors during transmission.",
        created_at: "2023-01-08T00:00:00Z",
      },
      {
        id: "q9",
        topic: "networks",
        question_text: "Describe how a star topology functions and one of its main advantages.",
        model_answer:
          "In a star topology, all devices are connected to a central hub or switch which manages communication. A key advantage is that if one connection fails, the rest of the network remains functional.",
        created_at: "2023-01-09T00:00:00Z",
      },
      {
        id: "q10",
        topic: "networks",
        question_text: "Why might a business choose a star topology instead of a mesh topology?",
        model_answer:
          "A business might choose a star topology because it is simpler to install and maintain, requires less cabling than a mesh, and offers good performance with minimal data collisions. Mesh networks are more complex and expensive to set up.",
        created_at: "2023-01-10T00:00:00Z",
      },
      {
        id: "q11",
        topic: "networks",
        question_text: "Explain the difference between a LAN and a WAN.",
        model_answer:
          "A LAN (Local Area Network) is a network that connects computers within a limited area like a home, school, or office building. A WAN (Wide Area Network) connects multiple LANs across large geographic distances, often using public infrastructure. The internet is the largest example of a WAN. LANs typically offer higher speeds and are privately managed, while WANs cover larger areas but may have lower speeds and higher latency.",
        created_at: "2023-01-11T00:00:00Z",
      },
      {
        id: "q12",
        topic: "networks",
        question_text: "What is the purpose of the TCP/IP protocol suite?",
        model_answer:
          "The TCP/IP (Transmission Control Protocol/Internet Protocol) suite is a set of communication protocols used to connect devices on the internet. It provides end-to-end data communication by specifying how data should be packetized, addressed, transmitted, routed, and received. TCP ensures reliable delivery of data packets, while IP handles the addressing and routing of packets across networks. Together, they form the foundation of internet communication.",
        created_at: "2023-01-12T00:00:00Z",
      },
      {
        id: "q13",
        topic: "networks",
        question_text: "Describe three different network topologies and their advantages.",
        model_answer:
          "1) Star topology: All devices connect to a central hub or switch. Advantages include easy installation, centralized management, and fault isolation (if one connection fails, others remain unaffected). 2) Bus topology: All devices connect to a single cable backbone. Advantages include simplicity, low cost, and easy to implement for small networks. 3) Ring topology: Devices are connected in a circular pattern. Advantages include equal access for all devices, good performance under heavy load, and predictable data transfer rates.",
        created_at: "2023-01-13T00:00:00Z",
      },
      {
        id: "q14",
        topic: "networks",
        question_text: "What is a firewall and why is it important for network security?",
        model_answer:
          "A firewall is a network security device or software that monitors and filters incoming and outgoing network traffic based on predetermined security rules. It acts as a barrier between a trusted internal network and untrusted external networks (like the internet). Firewalls are important because they prevent unauthorized access to private networks, block malicious traffic, protect sensitive data, and help prevent cyber attacks by controlling what traffic is allowed to enter or leave a network.",
        created_at: "2023-01-14T00:00:00Z",
      },
      {
        id: "q15",
        topic: "networks",
        question_text: "Explain how a switch works on a network.",
        model_answer:
          "A switch connects devices on a LAN and forwards data only to the intended recipient. It reads the destination MAC address in the packet header and uses its internal table of known addresses to send the data directly to the correct device, improving efficiency and security.",
        created_at: "2023-01-15T00:00:00Z",
      },
      {
        id: "q16",
        topic: "networks",
        question_text: "What is the purpose of a router in a network?",
        model_answer:
          "A router directs data packets between different networks. It uses the IP address in the packet header and its routing table to determine the best path for the data to travel. Routers are essential for internet communication, connecting local networks to the wider internet.",
        created_at: "2023-01-16T00:00:00Z",
      },
      {
        id: "q17",
        topic: "networks",
        question_text: "State what WAP stands for and explain its role in a network.",
        model_answer:
          "WAP stands for Wireless Access Point. It allows wireless devices to connect to a wired network, effectively creating a wireless LAN. WAPs are commonly used in homes, schools, and public places like airports or coffee shops to provide internet access.",
        created_at: "2023-01-17T00:00:00Z",
      },
      {
        id: "q18",
        topic: "networks",
        question_text: "What is a NIC and why is it needed in a computer?",
        model_answer:
          "NIC stands for Network Interface Card. It is a piece of hardware that allows a computer to connect to a network. It contains a MAC address and provides a physical interface (such as an Ethernet port) for wired connections. Modern NICs are usually built into the motherboard.",
        created_at: "2023-01-18T00:00:00Z",
      },
      {
        id: "q19",
        topic: "networks",
        question_text: "Describe the differences between three types of transmission media.",
        model_answer:
          "1) Ethernet cables (e.g. Cat5e, Cat6) are common in LANs and use electrical signals to transmit data. 2) Fibre optic cables transmit data as light, offering high speed and long distance, but are fragile and costly. 3) Coaxial cables are older, slower copper cables more prone to interference.",
        created_at: "2023-01-19T00:00:00Z",
      },
      {
        id: "q20",
        topic: "networks",
        question_text: "What is the internet and how is it different from the World Wide Web?",
        model_answer:
          "The internet is a global network of interconnected networks that allows computers to communicate. The World Wide Web is a collection of websites and web pages accessed using the internet. The web uses protocols like HTTPS, but it is only one service that runs on the internet.",
        created_at: "2023-01-20T00:00:00Z",
      },
      {
        id: "q21",
        topic: "networks",
        question_text: "What is web hosting and why is it necessary?",
        model_answer:
          "Web hosting is the service of storing website files on a server so they can be accessed via the internet. It is necessary because a website must be hosted on a web server to be publicly accessible. Hosting providers manage the server and make sure the site is always online.",
        created_at: "2023-01-21T00:00:00Z",
      },
      {
        id: "q22",
        topic: "networks",
        question_text: "What is a DNS server and what role does it play in accessing websites?",
        model_answer:
          "A DNS (Domain Name System) server translates domain names like www.google.com into IP addresses like 142.250.72.196. This allows browsers to locate and connect to the correct server. DNS is essential for human-readable website navigation on the internet.",
        created_at: "2023-01-22T00:00:00Z",
      },
      {
        id: "q23",
        topic: "networks",
        question_text: "What happens if a DNS server can't find the IP address of a domain name?",
        model_answer:
          "If a DNS server cannot resolve a domain name, it passes the query to another DNS server higher up in the DNS hierarchy. This process continues until the IP address is found, which is then passed back down the chain to the user's local DNS server and finally to the browser.",
        created_at: "2023-01-23T00:00:00Z",
      },
      {
        id: "q24",
        topic: "networks",
        question_text: "Explain two advantages and two disadvantages of cloud storage.",
        model_answer:
          "Advantages: 1) Accessible from multiple devices with internet access. 2) Easy collaboration and large storage capacity. Disadvantages: 1) Requires a stable internet connection. 2) Data security concerns if the provider is hacked or suffers downtime.",
        created_at: "2023-01-24T00:00:00Z",
      },
      {
        id: "q25",
        topic: "networks",
        question_text: "Explain the tasks a router performs when sending data across networks.",
        model_answer:
          "A router receives data packets and checks the destination IP address in the packet header. It uses its routing table to determine the best path to the destination network. The router then forwards the packet to the next router or the final destination.",
        created_at: "2023-01-25T00:00:00Z",
      },
      {
        id: "q26",
        topic: "networks",
        question_text: "Explain the tasks a switch performs in a network.",
        model_answer:
          "A switch receives data packets from devices on the network. It reads the destination MAC address in the packet header, checks its MAC address table to find the correct port, and then forwards the packet to the appropriate device. This reduces unnecessary traffic and improves network performance.",
        created_at: "2023-01-26T00:00:00Z",
      },
      {
        id: "q27",
        topic: "networks",
        question_text: "Explain the tasks a network interface card (NIC) performs in a computer system.",
        model_answer:
          "A NIC allows a computer to connect to a network by sending and receiving data. It formats data into packets, adds the device's MAC address, and handles the physical connection (e.g., through an Ethernet cable). It also receives packets from the network and passes them to the operating system for processing.",
        created_at: "2023-01-27T00:00:00Z",
      },
      {
        id: "q28",
        topic: "networks",
        question_text: "Explain how a NIC converts digital data for wired and wireless transmission.",
        model_answer:
          "A NIC converts digital data into signals for transmission. In a wired network, it converts data into electrical signals or light pulses. In a wireless network, it converts data into modulated radio waves. At the receiving end, another NIC converts the signals back into digital data.",
        created_at: "2023-01-28T00:00:00Z",
      },
      {
        id: "q29",
        topic: "networks",
        question_text: "What is a MAC address and why is it important on a LAN?",
        model_answer:
          "A MAC (Media Access Control) address is a unique 48-bit identifier assigned to each NIC. It is used on a LAN to identify individual devices. Switches use MAC addresses to send data directly to the correct device instead of broadcasting it to all devices on the network.",
        created_at: "2023-01-29T00:00:00Z",
      },
      {
        id: "q30",
        topic: "networks",
        question_text: "Explain how a switch uses MAC addresses to forward data packets.",
        model_answer:
          "A switch maintains a table of MAC addresses and the port each device is connected to. When it receives a data packet, it checks the destination MAC address in the packet header, looks it up in the table, and forwards the packet to the correct port to reach the intended device.",
        created_at: "2023-01-30T00:00:00Z",
      },
      {
        id: "q31",
        topic: "networks",
        question_text: "Describe how a router uses a routing table to send data across a WAN.",
        model_answer:
          "A router examines the destination IP address in a packet and checks its routing table for the best path. The routing table lists known networks and next-hop connections. The router forwards the packet to the next router or destination based on the best available route.",
        created_at: "2023-01-31T00:00:00Z",
      },
      {
        id: "q32",
        topic: "networks",
        question_text: "What is latency and what causes it on a network?",
        model_answer:
          "Latency is the delay between sending and receiving data. It is caused by factors such as signal travel time, processing delays in routers, and queueing delays when packets wait to be handled. Satellite links, for example, have higher latency due to distance.",
        created_at: "2023-02-01T00:00:00Z",
      },
      {
        id: "q33",
        topic: "networks",
        question_text: "Explain the difference between bandwidth and actual data transfer speed.",
        model_answer:
          "Bandwidth is the theoretical maximum rate of data transfer. Actual speed is often lower due to interference, congestion, and shared use. For example, wireless networks may offer high bandwidth but have slower real speeds because of signal loss or many users streaming video.",
        created_at: "2023-02-02T00:00:00Z",
      },
      {
        id: "q34",
        topic: "networks",
        question_text: "What is the effect of increasing the number of active users on a network?",
        model_answer:
          "More active users can increase network congestion, especially if they are using bandwidth-heavy services like video streaming. While a network may handle many idle devices easily, performance slows when multiple users are actively transferring large amounts of data.",
        created_at: "2023-02-03T00:00:00Z",
      },
      {
        id: "q35",
        topic: "networks",
        question_text: "Describe how the ping command is used to measure latency.",
        model_answer:
          "The ping command sends a small data packet to a destination and waits for a response. It measures the time taken for the packet to travel to the destination and back (round-trip time). This helps assess network latency and detect issues such as delay or packet loss.",
        created_at: "2023-02-04T00:00:00Z",
      },
      {
        id: "q36",
        topic: "networks",
        question_text: "Why are routers needed to connect different networks together?",
        model_answer:
          "Routers are needed to connect different networks because each network has its own IP address range. Routers inspect the destination IP address in each packet and decide the best path for delivery using a routing table, ensuring data reaches its destination even across the internet.",
        created_at: "2023-02-05T00:00:00Z",
      },
      {
        id: "q37",
        topic: "networks",
        question_text: "What is the role of telecommunications infrastructure in a WAN?",
        model_answer:
          "Most WANs use leased public telecommunications infrastructure to connect distant networks. Organisations pay providers for bandwidth on shared fibre or copper lines. Companies like Openreach and Virgin Media maintain these networks, which carry data between regions or countries.",
        created_at: "2023-02-06T00:00:00Z",
      },
      {
        id: "q38",
        topic: "networks",
        question_text: "Give the format of a MAC address.",
        model_answer:
          "A MAC address is 48 bits long and usually written in hexadecimal, split into six pairs separated by colons or dashes, like cd:f1:24:e4:89:a1.",
        created_at: "2023-02-07T00:00:00Z",
      },
      {
        id: "q39",
        topic: "networks",
        question_text: "Give the format of an IPv4 address.",
        model_answer:
          "An IPv4 address is 32 bits long and written in dotted decimal notation, split into four numbers between 0 and 255, like 192.168.0.1.",
        created_at: "2023-02-08T00:00:00Z",
      },
      {
        id: "q40",
        topic: "networks",
        question_text: "Give the format of an IPv6 address.",
        model_answer:
          "An IPv6 address is 128 bits long and written in hexadecimal, split into eight groups of four characters separated by colons, like 2001:0db8:85a3:0000:0000:8a2e:0370:7334.",
        created_at: "2023-02-09T00:00:00Z",
      },
      {
        id: "q41",
        topic: "networks",
        question_text: "What is the difference between an IP address and a MAC address?",
        model_answer:
          "An IP address is a logical address used to identify a device on a network and can change. A MAC address is a unique physical address assigned to a device's NIC by the manufacturer and cannot be changed.",
        created_at: "2023-02-10T00:00:00Z",
      },
      {
        id: "q42",
        topic: "networks",
        question_text: "Why was IPv6 developed?",
        model_answer:
          "IPv6 was developed because the internet was running out of IPv4 addresses. IPv6 uses 128-bit addresses, allowing for a much larger number of unique addresses.",
        created_at: "2023-02-11T00:00:00Z",
      },
      {
        id: "q43",
        topic: "networks",
        question_text: "What does IP stand for and what is its purpose?",
        model_answer:
          "IP stands for Internet Protocol. It is used to assign logical addresses to devices and route data packets between them across networks.",
        created_at: "2023-02-12T00:00:00Z",
      },
    ],
  },
  {
    id: "4",
    slug: "network-security",
    name: "Network Security",
    description: "Learn about security threats, prevention methods, and encryption",
    icon: Shield,
    questionCount: 0,
    questions: [],
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
    questions: [],
    unit: 2,
    disabled: true,
  },
  {
    id: "8",
    slug: "programming-fundamentals",
    name: "Programming Fundamentals",
    description: "Master variables, data types, operators, and control structures",
    icon: FileCode,
    questionCount: 0,
    questions: [],
    unit: 2,
    disabled: true,
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
    slug: "languages-ides",
    name: "Languages & IDEs",
    description: "Explore programming languages, translators, and development environments",
    icon: Terminal,
    questionCount: 0,
    questions: [],
    unit: 2,
    disabled: true,
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
