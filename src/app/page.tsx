import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Download, Music, Video } from "lucide-react";

// Mock data - in a real app, this would come from an API
const projects = [
  {
    id: 1,
    name: "Summer Campaign 2024",
    status: "In Progress",
    progress: 65,
    dueDate: "2024-03-15",
    type: "Audio Production",
  },
  {
    id: 2,
    name: "Brand Identity Package",
    status: "Review",
    progress: 90,
    dueDate: "2024-03-10",
    type: "Full Production",
  },
  {
    id: 3,
    name: "Podcast Intro/Outro",
    status: "Completed",
    progress: 100,
    dueDate: "2024-02-28",
    type: "Audio Production",
  },
];

const recentDeliverables = [
  {
    id: 1,
    name: "Final Mix - Summer Campaign",
    project: "Summer Campaign 2024",
    type: "Audio File",
    date: "2024-03-05",
    size: "12.5 MB",
  },
  {
    id: 2,
    name: "Brand Voice Guide",
    project: "Brand Identity Package",
    type: "PDF Document",
    date: "2024-03-03",
    size: "3.2 MB",
  },
  {
    id: 3,
    name: "Podcast Intro - Final",
    project: "Podcast Intro/Outro",
    type: "Audio File",
    date: "2024-02-28",
    size: "2.1 MB",
  },
  {
    id: 4,
    name: "Stems Package",
    project: "Summer Campaign 2024",
    type: "ZIP Archive",
    date: "2024-02-25",
    size: "45.8 MB",
  },
];

export default function Home() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your projects.
        </p>
      </div>

      {/* Project Cards Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">My Projects</h2>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <p className="mt-1 text-sm text-gray-500">{project.type}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      project.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : project.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-brand-orange transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Due Date</span>
                    <span className="font-medium text-gray-900">
                      {new Date(project.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Deliverables and Billing Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Deliverables Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Deliverables</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDeliverables.map((deliverable) => (
                    <TableRow key={deliverable.id}>
                      <TableCell className="font-medium">
                        {deliverable.name}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {deliverable.project}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          {deliverable.type === "Audio File" ? (
                            <Music className="h-4 w-4 text-brand-teal" />
                          ) : deliverable.type === "PDF Document" ? (
                            <Video className="h-4 w-4 text-brand-orange" />
                          ) : (
                            <Download className="h-4 w-4 text-brand-gold" />
                          )}
                          {deliverable.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(deliverable.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {deliverable.size}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Billing Summary Widget */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Billing Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Balance</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">$2,450.00</p>
                <p className="mt-1 text-sm text-gray-500">Due in 15 days</p>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-medium text-gray-900">$1,200.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Month</span>
                  <span className="font-medium text-gray-900">$1,250.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="font-medium text-gray-900">$8,500.00</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button variant="primary" className="w-full">
                  View Invoices
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Payment Methods
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
