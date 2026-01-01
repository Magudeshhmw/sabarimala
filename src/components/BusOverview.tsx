import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bus, Users, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function BusOverview() {
    const { users } = useAuth();
    const [selectedBus, setSelectedBus] = useState<string | null>(null);

    // Group users by bus
    const busGroups = users.reduce((acc, user) => {
        const busNum = user.bus_number || 'Unassigned';
        if (!acc[busNum]) {
            acc[busNum] = [];
        }
        acc[busNum].push(user);
        return acc;
    }, {} as Record<string, typeof users>);

    // Sort bus numbers (numeric if possible, then string)
    const sortedBuses = Object.keys(busGroups).sort((a, b) => {
        const nav = parseInt(a);
        const nbv = parseInt(b);
        if (!isNaN(nav) && !isNaN(nbv)) return nav - nbv;
        return a.localeCompare(b);
    });

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-heading font-semibold text-foreground flex items-center gap-2">
                <Bus className="w-5 h-5 text-primary" />
                Bus Manifests
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedBuses.map((busNum) => {
                    const passengers = busGroups[busNum];
                    const passengerCount = passengers.length;

                    return (
                        <Card
                            key={busNum}
                            className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary"
                            onClick={() => setSelectedBus(busNum)}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="flex justify-between items-center text-lg">
                                    <span>Bus {busNum}</span>
                                    <Badge variant="secondary" className="font-mono">
                                        {passengerCount}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span>Devotees Onboard</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={!!selectedBus} onOpenChange={() => setSelectedBus(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-heading">
                            <Bus className="w-6 h-6 text-primary" />
                            Bus {selectedBus} Passenger List
                        </DialogTitle>
                        <DialogDescription>
                            Total Passengers: {selectedBus ? busGroups[selectedBus]?.length : 0}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 mt-4 pr-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">No.</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Mobile</TableHead>
                                    <TableHead>Bag</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedBus && busGroups[selectedBus]?.map((passenger, index) => (
                                    <TableRow key={passenger.id}>
                                        <TableCell className="font-mono text-muted-foreground">{index + 1}</TableCell>
                                        <TableCell className="font-medium">{passenger.name}</TableCell>
                                        <TableCell className="font-mono text-xs">{passenger.mobile_number}</TableCell>
                                        <TableCell>{passenger.bag_number}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${passenger.payment_status === 'PAID'
                                                ? 'bg-success/10 text-success'
                                                : 'bg-destructive/10 text-destructive'
                                                }`}>
                                                {passenger.payment_status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}
