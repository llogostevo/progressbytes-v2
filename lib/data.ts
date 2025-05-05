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
    questionCount: 92,
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
          "1) Bandwidth – limited bandwidth can slow data transfer. 2) Number of users – more users can cause congestion. 3) Interference – physical obstacles like walls can weaken wireless signals and reduce performance.",
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
        model_answer: "• Bluetooth – used for short-range connections like wireless headphones because it uses low power\n• Wi-Fi – used for internet access across a building because it covers a wider area",
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
        model_answer: "• Copper cable – cheap and easy to install\n• Fibre optic cable – very high speed and long-distance transmission\n• Wireless – flexible and allows mobile access",
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
    questionCount: 44,
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
        question_text: "Write a pseudocode program that:\n• asks the user to input a test score\n• prints 'A' if score is 80 or more\n• prints 'B' if score is 60–79\n• prints 'C' if score is 40–59\n• prints 'F' if score is less than 40",
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
      }
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
    slug: "languages-ides",
    name: "Languages & IDEs",
    description: "Explore programming languages, translators, and development environments",
    icon: Terminal,
    questionCount: 12,
    questions: [
      {
        id: "q117",
        type: "text",
        topic: "languages-and-idEs",
        question_text: "Give two reasons why some programs are written in a low-level language.",
        model_answer: "1) Faster execution time.\n2) Allows direct control over hardware and memory.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q118",
        type: "short-answer",
        topic: "languages-and-idEs",
        question_text: "Describe the benefits of using a compiler instead of an interpreter when writing a program.",
        model_answer: "A compiler produces an executable file that can be run without a translator. It only needs to translate once, which can lead to faster execution. It also makes source code inaccessible to users and can report all errors after compilation.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q119",
        type: "code",
        topic: "languages-and-idEs",
        question_text: "Design an algorithm to:\n• Ask the user to input a pilot code and a date of birth\n• Write these inputs to the pilots.txt text file",
        model_answer: "pilotCode = input(\"Enter pilot code: \")\ndob = input(\"Enter date of birth: \")\nfile = open(\"pilots.txt\", \"a\")\nfile.write(pilotCode + ',' + dob + '\\n')\nfile.close()",
        model_answer_python: "pilot_code = input(\"Enter pilot code: \")\ndob = input(\"Enter date of birth: \")\nwith open('pilots.txt', 'a') as file:\n    file.write(f\"{pilot_code},{dob}\\n\")",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q120",
        type: "short-answer",
        topic: "languages-and-idEs",
        question_text: "Describe two advantages to the programmer of using a high-level language instead of a low-level language.",
        model_answer: "1) Easier to read and write as it uses English-like keywords.\n2) Portable – the same code can run on different types of processors.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q121",
        type: "matching",
        topic: "languages-and-idEs",
        question_text: "Match each statement to either Compiler, Interpreter, or Both:",
        pairs: [
          { statement: "Translates high-level code to low-level instructions.", match: "Both" },
          { statement: "Produces an executable file.", match: "Compiler" },
          { statement: "Program needs to be translated every time it is run.", match: "Interpreter" }
        ],
        model_answer: ["Both", "Compiler", "Interpreter"],
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q122",
        type: "matching",
        topic: "languages-and-idEs",
        question_text: "Match each statement to Low-level or High-level language:",
        pairs: [
          { statement: "The same language can be used on computers that use different hardware", match: "High-level" },
          { statement: "It allows the user to directly manipulate memory", match: "Low-level" },
          { statement: "It allows the user to write English-like words", match: "High-level" },
          { statement: "It always needs to be translated into object code or machine code", match: "High-level" }
        ],
        model_answer: ["High-level", "Low-level", "High-level", "High-level"],
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q123",
        type: "fill-in-the-blank",
        topic: "languages-and-idEs",
        question_text: "Complete the sentences about programming languages and translators:\n\nJack writes his program in a ______ language. This needs to be translated into machine code. An interpreter executes one line and ______ when it finds an error. A compiler produces an ______ file that can be run ______ the compiler.",
        model_answer: ["high-level", "stops", "executable", "without"],
        options: ["high-level", "low-level", "stops", "continues", "executable", "debug", "without", "with"],
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q124",
        type: "short-answer",
        topic: "languages-and-idEs",
        question_text: "State why the computer needs to translate high-level code before it can be executed.",
        model_answer: "Because the processor only understands machine code (binary).",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q125",
        type: "short-answer",
        topic: "languages-and-idEs",
        question_text: "Describe two differences between how a compiler and an interpreter would translate code.",
        model_answer: "1) A compiler translates the whole program at once and generates an executable file.\n2) An interpreter translates and runs the code line by line, stopping when it encounters an error.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q126",
        type: "matching",
        topic: "languages-and-idEs",
        question_text: "Match each feature to High-level or Low-level language:",
        pairs: [
          { statement: "Uses English-like keywords such as print and while", match: "High-level" },
          { statement: "Must be translated before the processor can execute code", match: "High-level" },
          { statement: "Code written is portable between different processors", match: "High-level" },
          { statement: "Requires the programmer to understand the processor’s registers and structure", match: "Low-level" }
        ],
        model_answer: ["High-level", "High-level", "High-level", "Low-level"],
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q127",
        type: "short-answer",
        topic: "languages-and-idEs",
        question_text: "Describe two common tools or features provided by an Integrated Development Environment (IDE).",
        model_answer: "1) Editor – allows the programmer to write and edit code.\n2) Debugger – helps identify and fix errors in the program.",
        created_at: "2025-05-05T00:00:00Z"
      },
      {
        id: "q128",
        type: "short-answer",
        topic: "languages-and-idEs",
        question_text: "Identify two features of an IDE that might be used when writing a program to calculate the area of a circle.",
        model_answer: "1) Error diagnostics such as auto-indentation or auto-correction.\n2) Run-time environment to test the program.",
        created_at: "2025-05-05T00:00:00Z"
      }
    ]
    ,
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
