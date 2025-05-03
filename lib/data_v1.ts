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
    questionCount: 72,
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
        question_text: "Devices in a local area network (LAN), such as those in an airport, are assigned IP and MAC addresses.\ni. Provide a valid example of an IPv4 address and one of an IPv6 address.",
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
        question_text: "A large organisation such as an airport uses wired connections in their LAN.\ni. Give two advantages of using wired connections for this type of environment.",
        model_answer: "• Fast connection/speed / high bandwidth / consistent bandwidth\n• … e.g. reduce delays at check in / by example for airport\n• Secure / unlikely to have unauthorised access/hacked / data transmissions are likely to be safe\n• … e.g. so that data about passengers/staff/aeroplanes is not intercepted / by example for airport\n• Little interference / little chance of data loss / reliable\n• … e.g. flight status is received without delay / by example for airport\n• Long range transmission\n• … e.g. airport has a large floor area/terminals / by example for airport",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q39",
        topic: "networks",
        type: "text",
        question_text: "Explain why a wireless connection could be beneficial in addition to a wired LAN in a busy workplace such as an airport.",
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
        question_text: "iii. What is the function of the switch in a star network topology?",
        model_answer: "• Connects the devices together in the network / allows devices to communicate in the network\n• Receives data from (all) devices in the star topology\n• Record/register/store the address of devices connected to it …\n• … in a table\n• Uses MAC address of devices\n• Direct data to destination\n• … if address not recorded transmit to all devices",
        created_at: "2025-05-02T00:00:00Z"
      },
      {
        id: "q42",
        topic: "networks",
        type: "text",
        question_text: "A student is using a computer to carry out various tasks online.\n\nDifferent protocols are used to transmit data across the internet depending on the task.\ni. Match the most suitable protocol to each of the following activities.\n\na. Accessing a news website\nb. Logging into an online banking account\nc. Downloading a file from a web server\nd. Receiving emails from a mail server",
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
        question_text: "In the same scenario, identify the server device and justify your answer.",
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
        question_text: "Fill in the blanks to complete the description of how a website is accessed and how IPv4 addressing works.",
        model_answer: "• A website is hosted on a web server.\n• The computers that access the websites are called clients.\n• The user enters a Uniform Resource Locator (URL) into a web browser.\n• The web browser sends a request to the Domain Name Server (DNS) for the matching IP address.\n• If found, the IP address is returned.\n• A request is then sent to the IP address.\n• An IPv4 address is made of 4 groups of digits, each from 0 to 255.\n• The groups are separated by a full stop.",
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
